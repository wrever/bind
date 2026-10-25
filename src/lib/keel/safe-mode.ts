/**
 * Safe Mode helpers for partner wallets. Classify balances and window state.
 * without owning Keel UI.
 */

import {
  lotStatus,
  remainingMs,
  transferable,
} from "./engine";
import type { Account, Address, KeelState, UnsettledLot } from "./types";

export type LotView = {
  id: string;
  amount: number;
  from: Address;
  frozen: boolean;
  status: "frozen" | "ready" | "unsettled";
  remainingMs: number;
};

export type SafeModeSnapshot = {
  address: Address;
  usdc: number;
  settled: number;
  unsettled: number;
  frozen: number;
  ready: number;
  transferable: number;
  canUnwrap: boolean;
  canExitUnsettled: boolean;
  lots: LotView[];
  windowMs: number;
  paused: boolean;
};

export function viewLots(
  account: Account,
  windowMs: number,
  now = Date.now(),
): LotView[] {
  return account.unsettled.map((lot: UnsettledLot) => ({
    id: lot.id,
    amount: lot.amount,
    from: lot.from,
    frozen: lot.frozen,
    status: lotStatus(lot, now, windowMs),
    remainingMs: remainingMs(lot, now, windowMs),
  }));
}

export function safeModeSnapshot(
  state: KeelState,
  address: Address,
  now = Date.now(),
): SafeModeSnapshot {
  const acc = state.accounts[address] ?? {
    address,
    usdc: 0,
    settled: 0,
    unsettled: [],
  };
  const lots = viewLots(acc, state.config.windowMs, now);
  const unsettled = lots
    .filter((l) => !l.frozen)
    .reduce((s, l) => s + l.amount, 0);
  const frozen = lots.filter((l) => l.frozen).reduce((s, l) => s + l.amount, 0);
  const ready = lots
    .filter((l) => l.status === "ready")
    .reduce((s, l) => s + l.amount, 0);

  return {
    address,
    usdc: acc.usdc,
    settled: acc.settled,
    unsettled,
    frozen,
    ready,
    transferable: transferable(acc),
    canUnwrap: !state.paused && acc.settled > 0,
    canExitUnsettled:
      !state.paused &&
      unsettled > 0 &&
      state.exitPoolUsdc > 0 &&
      state.config.allowExitPool !== false,
    lots,
    windowMs: state.config.windowMs,
    paused: state.paused,
  };
}

/** Partner-facing copy hints (i18n-ready keys). */
export const SAFE_MODE_COPY = {
  unsettledHint:
    "Retention: free unwrap/swap blocked; claimable if breached",
  settledHint: "Final: unwrap 1:1 to USDC",
  frozenHint: "Frozen pending claim resolve",
  readyHint: "Retention elapsed. Settle then unwrap",
  pausedHint: "Protocol paused. Deposits/transfers blocked",
  exitHint: "Exit Pool = paid escape from retention (not free)",
} as const;
