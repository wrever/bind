/**
 * Bind Safe Deposit — protocol adapter (Blend-like).
 *
 * Flow: user USDC → wrap (settled cover credit) → transfer into protocol
 * custody address as unsettled (cover window) → protocol credits user off/on-chain.
 *
 * Bind does not implement the money market; it wraps the movement.
 */

import {
  deposit,
  migrateState,
  openDisputeAsSender,
  por,
  settle,
  transfer,
  unwrap,
} from "./engine";
import type { Address, KeelState, ProofOfReserves } from "./types";

export type SafeDepositParams = {
  /** End-user address */
  user: Address;
  /** Protocol custody / pool address that receives covered credit */
  protocol: Address;
  amount: number;
};

export type SafeDepositResult = {
  state: KeelState;
  /** Unsettled lot id on the protocol address (cover window active) */
  lotId: string;
  por: ProofOfReserves;
};

export type SafeWithdrawParams = {
  user: Address;
  protocol: Address;
  /** Amount of settled credit to return to user as unsettled transfer */
  amount: number;
};

/**
 * User wraps USDC then sends covered credit to protocol (starts Bind window on protocol).
 */
export function safeDeposit(
  state: KeelState,
  params: SafeDepositParams,
): SafeDepositResult {
  let next = migrateState(state);
  const { user, protocol, amount } = params;
  if (user === protocol) throw new Error("user and protocol must differ");
  next = deposit(next, user, amount);
  next = transfer(next, user, protocol, amount);
  const lot = next.accounts[protocol]?.unsettled.slice(-1)[0];
  if (!lot) throw new Error("Safe deposit failed to create cover lot");
  return { state: next, lotId: lot.id, por: por(next) };
}

/**
 * Protocol returns settled (or transferable) credit to user as a new unsettled lot.
 * Call after protocol-side debit; Bind only moves cover credits.
 */
export function safeWithdraw(
  state: KeelState,
  params: SafeWithdrawParams,
): SafeDepositResult {
  let next = migrateState(state);
  const { user, protocol, amount } = params;
  next = transfer(next, protocol, user, amount);
  const lot = next.accounts[user]?.unsettled.slice(-1)[0];
  if (!lot) throw new Error("Safe withdraw failed to create cover lot");
  return { state: next, lotId: lot.id, por: por(next) };
}

/** After window T, settle protocol-held lots then optionally unwrap to USDC. */
export function settleProtocolLots(
  state: KeelState,
  protocol: Address,
  now = Date.now(),
): KeelState {
  return settle(migrateState(state), protocol, now);
}

export function unwrapUser(
  state: KeelState,
  user: Address,
  amount: number,
): KeelState {
  return unwrap(migrateState(state), user, amount);
}

/** User (original sender) opens claim on a Safe Deposit lot held by protocol. */
export function claimSafeDeposit(
  state: KeelState,
  user: Address,
  protocol: Address,
  lotId: string,
  reason = "Unauthorized protocol deposit / phishing",
): KeelState {
  return openDisputeAsSender(
    migrateState(state),
    user,
    protocol,
    lotId,
    reason,
  );
}

export const SAFE_DEPOSIT_COPY = {
  product: "Bind",
  title: "Safe Deposit",
  blurb:
    "Wrap USDC into Bind cover, then deposit to your protocol. Unsettled window = claimable; settled = final for the money market.",
  notCovered:
    "Protocol exploits, oracles, liquidations, and bad debt are out of scope.",
} as const;
