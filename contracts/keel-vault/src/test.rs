#![cfg(test)]

use crate::{KeelVault, KeelVaultClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

fn setup<'a>() -> (Env, KeelVaultClient<'a>, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbiter = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let usdc_admin = Address::generate(&env);
    let usdc = env.register_stellar_asset_contract_v2(usdc_admin.clone());
    let sac = token::StellarAssetClient::new(&env, &usdc.address());
    sac.mint(&alice, &1_000_000_000i128);
    // Seed Exit Pool inventory on the vault (must cover early-exit payouts).
    sac.mint(&admin, &200_000_000i128);

    let contract_id = env.register(KeelVault, ());
    let client = KeelVaultClient::new(&env, &contract_id);

    let token = token::Client::new(&env, &usdc.address());
    token.transfer(&admin, &contract_id, &100_000_000i128);

    client.initialize(
        &admin,
        &arbiter,
        &usdc.address(),
        &10u64,
        &30u32,
        &0i128,
        &100_000_000i128,
    );

    (env, client, alice, bob, usdc.address())
}

#[test]
fn deposit_transfer_settle_unwrap() {
    let (env, client, alice, bob, usdc) = setup();
    let token = token::Client::new(&env, &usdc);

    client.deposit(&alice, &100_000_000);
    assert_eq!(client.por().supply, 100_000_000);

    let lot = client.transfer(&alice, &bob, &40_000_000);
    assert!(lot > 0);
    assert_eq!(client.por().unsettled, 40_000_000);

    env.ledger().with_mut(|l| {
        l.timestamp += 11;
    });
    let moved = client.settle(&bob);
    assert_eq!(moved, 40_000_000);

    let bob_before = token.balance(&bob);
    client.unwrap(&bob, &40_000_000);
    assert_eq!(token.balance(&bob) - bob_before, 40_000_000);
    assert!(client.por().fully_backed);
}

#[test]
fn dispute_recover_by_arbiter() {
    let (_env, client, alice, bob, _usdc) = setup();
    client.deposit(&alice, &50_000_000);
    let lot = client.transfer(&alice, &bob, &20_000_000);
    client.dispute(&alice, &lot);
    client.resolve(&lot, &true);
    let por = client.por();
    assert_eq!(por.unsettled, 0);
    assert!(por.fully_backed);
    assert_eq!(por.settled, 50_000_000);
}

#[test]
fn pause_blocks_deposit() {
    let (_env, client, alice, _bob, _usdc) = setup();
    client.pause();
    let err = client.try_deposit(&alice, &1_000_000);
    assert!(err.is_err());
    client.unpause();
    client.deposit(&alice, &1_000_000);
}

#[test]
fn exit_pool_charges_fee() {
    let (env, client, alice, bob, usdc) = setup();
    let token = token::Client::new(&env, &usdc);
    client.deposit(&alice, &100_000_000);
    client.transfer(&alice, &bob, &40_000_000);
    let before = token.balance(&bob);
    let fee = client.exit(&bob, &40_000_000);
    assert!(fee > 0);
    assert_eq!(token.balance(&bob) - before, 40_000_000 - fee);
    assert!(client.por().fully_backed);
    let _ = env;
}
