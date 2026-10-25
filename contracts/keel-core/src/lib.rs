//! Keel core accounting — mirrors `src/lib/keel/engine.ts` (integer micro-units).
//! 1 USDC / rUSDC = 1_000_000 micros.

use std::collections::BTreeMap;

pub const MICRO: i128 = 1_000_000;

#[derive(Clone, Debug)]
pub struct Config {
    pub window_ms: u64,
    pub exit_fee_bps: u32,
    pub max_supply: i128,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            window_ms: 45_000,
            exit_fee_bps: 30,
            max_supply: 1_000_000 * MICRO,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Lot {
    pub id: u64,
    pub amount: i128,
    pub received_at: u64,
    pub frozen: bool,
    pub from: String,
}

#[derive(Clone, Debug, Default)]
pub struct Account {
    pub usdc: i128,
    pub settled: i128,
    pub unsettled: Vec<Lot>,
}

#[derive(Clone, Debug)]
pub struct Dispute {
    pub id: u64,
    pub claimant: String,
    pub lot_id: u64,
    pub amount: i128,
    pub status: DisputeStatus,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DisputeStatus {
    Open,
    Approved,
    Rejected,
}

#[derive(Clone, Debug)]
pub struct State {
    pub config: Config,
    pub vault_usdc: i128,
    pub exit_pool_usdc: i128,
    pub protocol_fees_earned: i128,
    pub paused: bool,
    pub accounts: BTreeMap<String, Account>,
    pub disputes: Vec<Dispute>,
    next_lot: u64,
    next_dispute: u64,
}

impl State {
    pub fn new(config: Config) -> Self {
        let mut s = Self {
            config,
            vault_usdc: 0,
            exit_pool_usdc: 25_000 * MICRO,
            protocol_fees_earned: 0,
            paused: false,
            accounts: BTreeMap::new(),
            disputes: Vec::new(),
            next_lot: 1,
            next_dispute: 1,
        };
        s.ensure("alice").usdc = 10_000 * MICRO;
        s.ensure("bob").usdc = 2_000 * MICRO;
        s.ensure("merchant").usdc = 500 * MICRO;
        s
    }

    fn ensure(&mut self, addr: &str) -> &mut Account {
        self.accounts.entry(addr.to_string()).or_default()
    }

    pub fn supply(&self) -> i128 {
        self.accounts.values().map(|a| {
            a.settled + a.unsettled.iter().map(|l| l.amount).sum::<i128>()
        }).sum()
    }

    pub fn fully_backed(&self) -> bool {
        self.vault_usdc >= self.supply()
    }

    fn assert_active(&self) -> Result<(), String> {
        if self.paused {
            return Err("Protocol paused".into());
        }
        Ok(())
    }

    fn assert_peg(&self) -> Result<(), String> {
        if self.vault_usdc < self.supply() {
            return Err(format!(
                "Peg broken: vault {} < supply {}",
                self.vault_usdc,
                self.supply()
            ));
        }
        Ok(())
    }

    pub fn set_paused(&mut self, paused: bool) {
        self.paused = paused;
    }

    pub fn deposit(&mut self, addr: &str, amount: i128) -> Result<(), String> {
        self.assert_active()?;
        if amount <= 0 {
            return Err("Amount must be positive".into());
        }
        let supply = self.supply();
        if self.config.max_supply > 0 && supply + amount > self.config.max_supply {
            return Err("Supply cap exceeded".into());
        }
        let acc = self.ensure(addr);
        if acc.usdc < amount {
            return Err("Insufficient USDC".into());
        }
        acc.usdc -= amount;
        self.vault_usdc += amount;
        self.ensure(addr).settled += amount;
        self.assert_peg()
    }

    pub fn transfer(&mut self, from: &str, to: &str, amount: i128, now: u64) -> Result<(), String> {
        self.assert_active()?;
        if from == to {
            return Err("Cannot transfer to self".into());
        }
        if amount <= 0 {
            return Err("Amount must be positive".into());
        }
        self.debit_rusdc(from, amount)?;
        let lot_id = self.next_lot;
        self.next_lot += 1;
        self.ensure(to).unsettled.push(Lot {
            id: lot_id,
            amount,
            received_at: now,
            frozen: false,
            from: from.to_string(),
        });
        self.assert_peg()
    }

    fn debit_rusdc(&mut self, addr: &str, amount: i128) -> Result<(), String> {
        let acc = self.ensure(addr);
        let avail = acc.settled
            + acc
                .unsettled
                .iter()
                .filter(|l| !l.frozen)
                .map(|l| l.amount)
                .sum::<i128>();
        if avail < amount {
            return Err("Insufficient rUSDC".into());
        }
        let mut left = amount;
        let take = left.min(acc.settled);
        acc.settled -= take;
        left -= take;
        if left == 0 {
            return Ok(());
        }
        acc.unsettled.sort_by_key(|l| l.received_at);
        let mut keep = Vec::new();
        for lot in acc.unsettled.drain(..) {
            if left == 0 || lot.frozen {
                keep.push(lot);
                continue;
            }
            if lot.amount <= left {
                left -= lot.amount;
            } else {
                keep.push(Lot {
                    amount: lot.amount - left,
                    ..lot
                });
                left = 0;
            }
        }
        if left > 0 {
            return Err("Insufficient transferable rUSDC".into());
        }
        acc.unsettled = keep;
        Ok(())
    }

    pub fn settle(&mut self, addr: &str, now: u64) -> Result<i128, String> {
        let window = self.config.window_ms;
        let acc = self.ensure(addr);
        let mut moved = 0i128;
        let mut keep = Vec::new();
        for lot in acc.unsettled.drain(..) {
            if !lot.frozen && now.saturating_sub(lot.received_at) >= window {
                acc.settled += lot.amount;
                moved += lot.amount;
            } else {
                keep.push(lot);
            }
        }
        acc.unsettled = keep;
        self.assert_peg()?;
        Ok(moved)
    }

    pub fn settle_all(&mut self, now: u64) -> Result<i128, String> {
        let addrs: Vec<String> = self.accounts.keys().cloned().collect();
        let mut total = 0i128;
        for a in addrs {
            total += self.settle(&a, now)?;
        }
        Ok(total)
    }

    pub fn unwrap(&mut self, addr: &str, amount: i128) -> Result<(), String> {
        self.assert_active()?;
        if amount <= 0 {
            return Err("Amount must be positive".into());
        }
        if self.vault_usdc < amount {
            return Err("Vault underfunded".into());
        }
        {
            let acc = self.ensure(addr);
            if acc.settled < amount {
                return Err("Unwrap requires settled rUSDC".into());
            }
            acc.settled -= amount;
            acc.usdc += amount;
        }
        self.vault_usdc -= amount;
        self.assert_peg()
    }

    pub fn exit_pool(&mut self, addr: &str, amount: i128) -> Result<i128, String> {
        self.assert_active()?;
        if amount <= 0 {
            return Err("Amount must be positive".into());
        }
        let fee = amount * i128::from(self.config.exit_fee_bps) / 10_000;
        let payout = amount - fee;
        if payout <= 0 {
            return Err("Fee consumes entire amount".into());
        }
        if self.exit_pool_usdc < payout {
            return Err("Exit Pool lacks liquidity".into());
        }
        self.debit_unsettled_only(addr, amount)?;
        self.vault_usdc -= amount;
        self.exit_pool_usdc = self.exit_pool_usdc - payout + amount;
        self.protocol_fees_earned += fee;
        self.ensure(addr).usdc += payout;
        self.assert_peg()?;
        Ok(fee)
    }

    fn debit_unsettled_only(&mut self, addr: &str, amount: i128) -> Result<(), String> {
        let acc = self.ensure(addr);
        let mut left = amount;
        acc.unsettled.sort_by_key(|l| l.received_at);
        let mut keep = Vec::new();
        for lot in acc.unsettled.drain(..) {
            if left == 0 || lot.frozen {
                keep.push(lot);
                continue;
            }
            if lot.amount <= left {
                left -= lot.amount;
            } else {
                keep.push(Lot {
                    amount: lot.amount - left,
                    ..lot
                });
                left = 0;
            }
        }
        if left > 0 {
            return Err("Insufficient unsettled rUSDC".into());
        }
        acc.unsettled = keep;
        Ok(())
    }

    pub fn open_dispute_as_sender(
        &mut self,
        sender: &str,
        receiver: &str,
        lot_id: u64,
    ) -> Result<u64, String> {
        let lot = self
            .ensure(receiver)
            .unsettled
            .iter_mut()
            .find(|l| l.id == lot_id)
            .ok_or("Lot not found on receiver")?;
        if lot.from != sender {
            return Err("Only original sender can dispute this lot".into());
        }
        if lot.frozen {
            return Err("Lot already frozen".into());
        }
        lot.frozen = true;
        let amount = lot.amount;
        let id = self.next_dispute;
        self.next_dispute += 1;
        self.disputes.push(Dispute {
            id,
            claimant: sender.to_string(),
            lot_id,
            amount,
            status: DisputeStatus::Open,
        });
        Ok(id)
    }

    pub fn resolve_dispute(&mut self, dispute_id: u64, approve: bool) -> Result<(), String> {
        let idx = self
            .disputes
            .iter()
            .position(|d| d.id == dispute_id)
            .ok_or("Dispute not found")?;
        if self.disputes[idx].status != DisputeStatus::Open {
            return Err("Dispute already resolved".into());
        }
        let lot_id = self.disputes[idx].lot_id;
        let claimant = self.disputes[idx].claimant.clone();
        let amount = self.disputes[idx].amount;

        let mut holder_addr: Option<String> = None;
        for (addr, acc) in self.accounts.iter() {
            if acc.unsettled.iter().any(|l| l.id == lot_id) {
                holder_addr = Some(addr.clone());
                break;
            }
        }
        let holder = holder_addr.ok_or("Frozen lot missing")?;

        if approve {
            let acc = self.ensure(&holder);
            acc.unsettled.retain(|l| l.id != lot_id);
            self.ensure(&claimant).settled += amount;
            self.disputes[idx].status = DisputeStatus::Approved;
        } else {
            if let Some(lot) = self
                .ensure(&holder)
                .unsettled
                .iter_mut()
                .find(|l| l.id == lot_id)
            {
                lot.frozen = false;
            }
            self.disputes[idx].status = DisputeStatus::Rejected;
        }
        self.assert_peg()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deposit_transfer_recover_settle_exit_keep_peg() {
        let mut s = State::new(Config {
            window_ms: 10,
            ..Config::default()
        });
        s.deposit("alice", 200 * MICRO).unwrap();
        s.transfer("alice", "bob", 50 * MICRO, 0).unwrap();
        let lot_id = s.accounts["bob"].unsettled[0].id;
        let d = s.open_dispute_as_sender("alice", "bob", lot_id).unwrap();
        s.resolve_dispute(d, true).unwrap();
        assert!(s.accounts["alice"].settled >= 150 * MICRO);

        s.transfer("alice", "bob", 20 * MICRO, 100).unwrap();
        s.settle("bob", 200).unwrap();
        s.unwrap("bob", 20 * MICRO).unwrap();
        assert!(s.fully_backed());

        s.deposit("alice", 100 * MICRO).unwrap();
        s.transfer("alice", "merchant", 40 * MICRO, 300).unwrap();
        let fee = s.exit_pool("merchant", 40 * MICRO).unwrap();
        assert!(fee > 0);
        assert!(s.fully_backed());
        assert!(s.protocol_fees_earned > 0);
    }

    #[test]
    fn pause_blocks_deposit() {
        let mut s = State::new(Config::default());
        s.set_paused(true);
        assert!(s.deposit("alice", MICRO).is_err());
        s.set_paused(false);
        assert!(s.deposit("alice", MICRO).is_ok());
    }

    #[test]
    fn supply_cap() {
        let mut s = State::new(Config {
            max_supply: 50 * MICRO,
            ..Config::default()
        });
        assert!(s.deposit("alice", 50 * MICRO).is_ok());
        assert!(s.deposit("alice", MICRO).is_err());
    }

    #[test]
    fn settle_all_keeper() {
        let mut s = State::new(Config {
            window_ms: 10,
            ..Config::default()
        });
        s.deposit("alice", 100 * MICRO).unwrap();
        s.transfer("alice", "bob", 30 * MICRO, 0).unwrap();
        s.transfer("alice", "merchant", 20 * MICRO, 0).unwrap();
        let moved = s.settle_all(50).unwrap();
        assert_eq!(moved, 50 * MICRO);
        assert!(s.fully_backed());
    }
}
