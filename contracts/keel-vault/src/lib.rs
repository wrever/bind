#![no_std]
//! Keel Vault — Soroban recoverable rails (rUSDC-style credits over a USDC SAC).
//!
//! Mirrors off-chain engine rules:
//! deposit → settled; transfer → unsettled lot; settle after window;
//! unwrap settled; exit unsettled with fee; arbiter freeze/recover; pause.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Map,
    Symbol, Vec,
};

const DATA_ADMIN: Symbol = symbol_short!("ADMIN");
const DATA_ARBITER: Symbol = symbol_short!("ARBITER");
const DATA_USDC: Symbol = symbol_short!("USDC");
const DATA_CFG: Symbol = symbol_short!("CFG");
const DATA_PAUSED: Symbol = symbol_short!("PAUSED");
const DATA_VAULT: Symbol = symbol_short!("VAULT");
const DATA_FEES: Symbol = symbol_short!("FEES");
const DATA_EXIT: Symbol = symbol_short!("EXITLP");
const DATA_NEXT_LOT: Symbol = symbol_short!("NEXTLOT");
const DATA_SETTLED: Symbol = symbol_short!("SETTLED");
const DATA_LOTS: Symbol = symbol_short!("LOTS");
const DATA_OPEN_DSP: Symbol = symbol_short!("OPENDSP");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub window_secs: u64,
    pub exit_fee_bps: u32,
    pub max_supply: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lot {
    pub id: u64,
    pub owner: Address,
    pub amount: i128,
    pub received_at: u64,
    pub frozen: bool,
    pub from: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Por {
    pub vault_usdc: i128,
    pub supply: i128,
    pub settled: i128,
    pub unsettled: i128,
    pub exit_pool: i128,
    pub fees_earned: i128,
    pub paused: bool,
    pub fully_backed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Credits {
    pub settled: i128,
    pub unsettled: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInit = 1,
    NotInit = 2,
    Paused = 3,
    Unauthorized = 4,
    BadAmount = 5,
    Insufficient = 6,
    CapExceeded = 7,
    NotFound = 8,
    WindowOpen = 9,
    Frozen = 10,
    NotFrozen = 11,
    SelfTransfer = 12,
    ExitIlliquid = 13,
    PegBroken = 14,
}

#[contract]
pub struct KeelVault;

#[contractimpl]
impl KeelVault {
    pub fn initialize(
        env: Env,
        admin: Address,
        arbiter: Address,
        usdc: Address,
        window_secs: u64,
        exit_fee_bps: u32,
        max_supply: i128,
        exit_pool_seed: i128,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DATA_ADMIN) {
            return Err(Error::AlreadyInit);
        }
        admin.require_auth();
        env.storage().instance().set(&DATA_ADMIN, &admin);
        env.storage().instance().set(&DATA_ARBITER, &arbiter);
        env.storage().instance().set(&DATA_USDC, &usdc);
        env.storage().instance().set(
            &DATA_CFG,
            &Config {
                window_secs,
                exit_fee_bps,
                max_supply,
            },
        );
        env.storage().instance().set(&DATA_PAUSED, &false);
        env.storage().instance().set(&DATA_VAULT, &0i128);
        env.storage().instance().set(&DATA_FEES, &0i128);
        env.storage().instance().set(&DATA_EXIT, &exit_pool_seed);
        env.storage().instance().set(&DATA_NEXT_LOT, &1u64);
        env.storage()
            .persistent()
            .set(&DATA_SETTLED, &Map::<Address, i128>::new(&env));
        env.storage()
            .persistent()
            .set(&DATA_LOTS, &Map::<u64, Lot>::new(&env));
        env.storage()
            .persistent()
            .set(&DATA_OPEN_DSP, &Map::<u64, Address>::new(&env));
        Ok(())
    }

    pub fn pause(env: Env) -> Result<(), Error> {
        Self::require_admin(&env)?;
        env.storage().instance().set(&DATA_PAUSED, &true);
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), Error> {
        Self::require_admin(&env)?;
        env.storage().instance().set(&DATA_PAUSED, &false);
        Ok(())
    }

    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        Self::require_active(&env)?;
        from.require_auth();
        Self::require_positive(amount)?;
        let supply = Self::total_supply(&env);
        let cfg: Config = env.storage().instance().get(&DATA_CFG).unwrap();
        if cfg.max_supply > 0 && supply + amount > cfg.max_supply {
            return Err(Error::CapExceeded);
        }
        let usdc: Address = env.storage().instance().get(&DATA_USDC).unwrap();
        token::Client::new(&env, &usdc).transfer(&from, &env.current_contract_address(), &amount);
        let mut vault: i128 = env.storage().instance().get(&DATA_VAULT).unwrap();
        vault += amount;
        env.storage().instance().set(&DATA_VAULT, &vault);
        let mut settled = Self::settled_map(&env);
        let cur = settled.get(from.clone()).unwrap_or(0);
        settled.set(from, cur + amount);
        env.storage().persistent().set(&DATA_SETTLED, &settled);
        Self::assert_peg(&env)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<u64, Error> {
        Self::require_active(&env)?;
        from.require_auth();
        if from == to {
            return Err(Error::SelfTransfer);
        }
        Self::require_positive(amount)?;
        Self::debit(&env, &from, amount)?;
        let now = env.ledger().timestamp();
        let lot_id: u64 = env.storage().instance().get(&DATA_NEXT_LOT).unwrap();
        env.storage().instance().set(&DATA_NEXT_LOT, &(lot_id + 1));
        let mut lots = Self::lots_map(&env);
        lots.set(
            lot_id,
            Lot {
                id: lot_id,
                owner: to,
                amount,
                received_at: now,
                frozen: false,
                from,
            },
        );
        env.storage().persistent().set(&DATA_LOTS, &lots);
        Self::assert_peg(&env)?;
        Ok(lot_id)
    }

    pub fn settle(env: Env, who: Address) -> Result<i128, Error> {
        // allowed while paused
        let cfg: Config = env.storage().instance().get(&DATA_CFG).unwrap();
        let now = env.ledger().timestamp();
        let mut lots = Self::lots_map(&env);
        let keys = lots.keys();
        let mut moved: i128 = 0;
        let mut settled = Self::settled_map(&env);
        for k in keys.iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == who
                && !lot.frozen
                && now.saturating_sub(lot.received_at) >= cfg.window_secs
            {
                moved += lot.amount;
                let cur = settled.get(who.clone()).unwrap_or(0);
                settled.set(who.clone(), cur + lot.amount);
                lots.remove(k);
            }
        }
        env.storage().persistent().set(&DATA_LOTS, &lots);
        env.storage().persistent().set(&DATA_SETTLED, &settled);
        Self::assert_peg(&env)?;
        Ok(moved)
    }

    pub fn unwrap(env: Env, who: Address, amount: i128) -> Result<(), Error> {
        Self::require_active(&env)?;
        who.require_auth();
        Self::require_positive(amount)?;
        let mut settled = Self::settled_map(&env);
        let cur = settled.get(who.clone()).unwrap_or(0);
        if cur < amount {
            return Err(Error::Insufficient);
        }
        let mut vault: i128 = env.storage().instance().get(&DATA_VAULT).unwrap();
        if vault < amount {
            return Err(Error::Insufficient);
        }
        settled.set(who.clone(), cur - amount);
        vault -= amount;
        env.storage().persistent().set(&DATA_SETTLED, &settled);
        env.storage().instance().set(&DATA_VAULT, &vault);
        let usdc: Address = env.storage().instance().get(&DATA_USDC).unwrap();
        token::Client::new(&env, &usdc).transfer(&env.current_contract_address(), &who, &amount);
        Self::assert_peg(&env)
    }

    pub fn exit(env: Env, who: Address, amount: i128) -> Result<i128, Error> {
        Self::require_active(&env)?;
        who.require_auth();
        Self::require_positive(amount)?;
        let cfg: Config = env.storage().instance().get(&DATA_CFG).unwrap();
        let fee = amount * i128::from(cfg.exit_fee_bps) / 10_000;
        let payout = amount - fee;
        if payout <= 0 {
            return Err(Error::BadAmount);
        }
        let mut exit_lp: i128 = env.storage().instance().get(&DATA_EXIT).unwrap();
        if exit_lp < payout {
            return Err(Error::ExitIlliquid);
        }
        Self::debit_unsettled_only(&env, &who, amount)?;
        let mut vault: i128 = env.storage().instance().get(&DATA_VAULT).unwrap();
        vault -= amount;
        exit_lp = exit_lp - payout + amount;
        let mut fees: i128 = env.storage().instance().get(&DATA_FEES).unwrap();
        fees += fee;
        env.storage().instance().set(&DATA_VAULT, &vault);
        env.storage().instance().set(&DATA_EXIT, &exit_lp);
        env.storage().instance().set(&DATA_FEES, &fees);
        let usdc: Address = env.storage().instance().get(&DATA_USDC).unwrap();
        token::Client::new(&env, &usdc).transfer(&env.current_contract_address(), &who, &payout);
        Self::assert_peg(&env)?;
        Ok(fee)
    }

    pub fn dispute(env: Env, sender: Address, lot_id: u64) -> Result<(), Error> {
        sender.require_auth();
        let mut lots = Self::lots_map(&env);
        let mut lot = lots.get(lot_id).ok_or(Error::NotFound)?;
        if lot.from != sender {
            return Err(Error::Unauthorized);
        }
        if lot.frozen {
            return Err(Error::Frozen);
        }
        lot.frozen = true;
        lots.set(lot_id, lot.clone());
        env.storage().persistent().set(&DATA_LOTS, &lots);
        let mut open = Self::open_dsp(&env);
        open.set(lot_id, sender);
        env.storage().persistent().set(&DATA_OPEN_DSP, &open);
        Ok(())
    }

    pub fn resolve(env: Env, lot_id: u64, approve: bool) -> Result<(), Error> {
        Self::require_arbiter(&env)?;
        let mut lots = Self::lots_map(&env);
        let lot = lots.get(lot_id).ok_or(Error::NotFound)?;
        if !lot.frozen {
            return Err(Error::NotFrozen);
        }
        let mut open = Self::open_dsp(&env);
        let claimant = open.get(lot_id).ok_or(Error::NotFound)?;
        if approve {
            let amount = lot.amount;
            lots.remove(lot_id);
            env.storage().persistent().set(&DATA_LOTS, &lots);
            let mut settled = Self::settled_map(&env);
            let cur = settled.get(claimant.clone()).unwrap_or(0);
            settled.set(claimant, cur + amount);
            env.storage().persistent().set(&DATA_SETTLED, &settled);
        } else {
            let mut lot = lot;
            lot.frozen = false;
            lots.set(lot_id, lot);
            env.storage().persistent().set(&DATA_LOTS, &lots);
        }
        open.remove(lot_id);
        env.storage().persistent().set(&DATA_OPEN_DSP, &open);
        Self::assert_peg(&env)
    }

    pub fn por(env: Env) -> Result<Por, Error> {
        Self::require_init(&env)?;
        let vault: i128 = env.storage().instance().get(&DATA_VAULT).unwrap();
        let (settled, unsettled) = Self::supply_parts(&env);
        let supply = settled + unsettled;
        Ok(Por {
            vault_usdc: vault,
            supply,
            settled,
            unsettled,
            exit_pool: env.storage().instance().get(&DATA_EXIT).unwrap(),
            fees_earned: env.storage().instance().get(&DATA_FEES).unwrap(),
            paused: env.storage().instance().get(&DATA_PAUSED).unwrap(),
            fully_backed: vault >= supply,
        })
    }

    /// Read-only per-address settled + unsettled credits (no auth).
    pub fn credits(env: Env, who: Address) -> Result<Credits, Error> {
        Self::require_init(&env)?;
        let settled = Self::settled_map(&env).get(who.clone()).unwrap_or(0);
        let lots = Self::lots_map(&env);
        let mut unsettled = 0i128;
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == who {
                unsettled += lot.amount;
            }
        }
        Ok(Credits { settled, unsettled })
    }

    /// Read-only lots owned by `who` (no auth).
    pub fn lots_of(env: Env, who: Address) -> Result<Vec<Lot>, Error> {
        Self::require_init(&env)?;
        let lots = Self::lots_map(&env);
        let mut out: Vec<Lot> = Vec::new(&env);
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == who {
                out.push_back(lot);
            }
        }
        Ok(out)
    }

    // --- internals ---

    fn require_init(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&DATA_ADMIN) {
            return Err(Error::NotInit);
        }
        Ok(())
    }

    fn require_active(env: &Env) -> Result<(), Error> {
        Self::require_init(env)?;
        let paused: bool = env.storage().instance().get(&DATA_PAUSED).unwrap();
        if paused {
            return Err(Error::Paused);
        }
        Ok(())
    }

    fn require_admin(env: &Env) -> Result<(), Error> {
        Self::require_init(env)?;
        let admin: Address = env.storage().instance().get(&DATA_ADMIN).unwrap();
        admin.require_auth();
        Ok(())
    }

    fn require_arbiter(env: &Env) -> Result<(), Error> {
        Self::require_init(env)?;
        let arbiter: Address = env.storage().instance().get(&DATA_ARBITER).unwrap();
        arbiter.require_auth();
        Ok(())
    }

    fn require_positive(amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::BadAmount);
        }
        Ok(())
    }

    fn settled_map(env: &Env) -> Map<Address, i128> {
        env.storage().persistent().get(&DATA_SETTLED).unwrap()
    }

    fn lots_map(env: &Env) -> Map<u64, Lot> {
        env.storage().persistent().get(&DATA_LOTS).unwrap()
    }

    fn open_dsp(env: &Env) -> Map<u64, Address> {
        env.storage().persistent().get(&DATA_OPEN_DSP).unwrap()
    }

    fn total_supply(env: &Env) -> i128 {
        let (s, u) = Self::supply_parts(env);
        s + u
    }

    fn supply_parts(env: &Env) -> (i128, i128) {
        let settled = Self::settled_map(env);
        let mut s: i128 = 0;
        for k in settled.keys().iter() {
            s += settled.get(k).unwrap_or(0);
        }
        let lots = Self::lots_map(env);
        let mut u: i128 = 0;
        for k in lots.keys().iter() {
            u += lots.get(k).unwrap().amount;
        }
        (s, u)
    }

    fn transferable(env: &Env, who: &Address) -> i128 {
        let settled = Self::settled_map(env).get(who.clone()).unwrap_or(0);
        let lots = Self::lots_map(env);
        let mut u = 0i128;
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == *who && !lot.frozen {
                u += lot.amount;
            }
        }
        settled + u
    }

    fn debit(env: &Env, who: &Address, amount: i128) -> Result<(), Error> {
        if Self::transferable(env, who) < amount {
            return Err(Error::Insufficient);
        }
        let mut left = amount;
        let mut settled = Self::settled_map(env);
        let cur = settled.get(who.clone()).unwrap_or(0);
        let take = if cur < left { cur } else { left };
        settled.set(who.clone(), cur - take);
        left -= take;
        env.storage().persistent().set(&DATA_SETTLED, &settled);
        if left == 0 {
            return Ok(());
        }
        let mut lots = Self::lots_map(env);
        // collect candidate lot ids owned & unfrozen, sorted by id (~time)
        let mut ids: Vec<u64> = Vec::new(env);
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == *who && !lot.frozen {
                ids.push_back(k);
            }
        }
        // sort ids ascending
        let n = ids.len();
        let mut i = 0u32;
        while i < n {
            let mut j = i + 1;
            while j < n {
                if ids.get(j).unwrap() < ids.get(i).unwrap() {
                    let a = ids.get(i).unwrap();
                    let b = ids.get(j).unwrap();
                    ids.set(i, b);
                    ids.set(j, a);
                }
                j += 1;
            }
            i += 1;
        }
        let mut ii = 0u32;
        while ii < ids.len() && left > 0 {
            let id = ids.get(ii).unwrap();
            let mut lot = lots.get(id).unwrap();
            if lot.amount <= left {
                left -= lot.amount;
                lots.remove(id);
            } else {
                lot.amount -= left;
                left = 0;
                lots.set(id, lot);
            }
            ii += 1;
        }
        if left > 0 {
            return Err(Error::Insufficient);
        }
        env.storage().persistent().set(&DATA_LOTS, &lots);
        Ok(())
    }

    fn debit_unsettled_only(env: &Env, who: &Address, amount: i128) -> Result<(), Error> {
        let mut lots = Self::lots_map(env);
        let mut avail = 0i128;
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == *who && !lot.frozen {
                avail += lot.amount;
            }
        }
        if avail < amount {
            return Err(Error::Insufficient);
        }
        let mut left = amount;
        let mut ids: Vec<u64> = Vec::new(env);
        for k in lots.keys().iter() {
            let lot = lots.get(k).unwrap();
            if lot.owner == *who && !lot.frozen {
                ids.push_back(k);
            }
        }
        let n = ids.len();
        let mut i = 0u32;
        while i < n {
            let mut j = i + 1;
            while j < n {
                if ids.get(j).unwrap() < ids.get(i).unwrap() {
                    let a = ids.get(i).unwrap();
                    let b = ids.get(j).unwrap();
                    ids.set(i, b);
                    ids.set(j, a);
                }
                j += 1;
            }
            i += 1;
        }
        let mut ii = 0u32;
        while ii < ids.len() && left > 0 {
            let id = ids.get(ii).unwrap();
            let mut lot = lots.get(id).unwrap();
            if lot.amount <= left {
                left -= lot.amount;
                lots.remove(id);
            } else {
                lot.amount -= left;
                left = 0;
                lots.set(id, lot);
            }
            ii += 1;
        }
        env.storage().persistent().set(&DATA_LOTS, &lots);
        Ok(())
    }

    fn assert_peg(env: &Env) -> Result<(), Error> {
        let vault: i128 = env.storage().instance().get(&DATA_VAULT).unwrap();
        if vault < Self::total_supply(env) {
            return Err(Error::PegBroken);
        }
        Ok(())
    }
}

#[cfg(test)]
mod test;