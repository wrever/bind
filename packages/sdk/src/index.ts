/**
 * @keel/sdk — TypeScript client surface for Keel recoverable rails.
 */

import {
  applyRetentionProfile,
  createInitialState,
  deposit,
  transfer,
  settle,
  settleAll,
  unwrap,
  exitPool,
  faucet,
  freezeLot,
  openDisputeAsSender,
  resolveDispute,
  setPaused,
  por,
  remainingMs,
  lotStatus,
  migrateState,
  supply,
  transferable,
  DEMO_ADDRESSES,
} from "../../../src/lib/keel/engine";
import { DEFAULT_ROLES, hasRole, requireRole } from "../../../src/lib/keel/roles";

export type {
  Address,
  Account,
  Dispute,
  KeelConfig,
  KeelEvent,
  KeelState,
  KeelRoles,
  Role,
  ProofOfReserves,
  UnsettledLot,
} from "../../../src/lib/keel/types";

export {
  applyRetentionProfile,
  createInitialState,
  deposit,
  transfer,
  settle,
  settleAll,
  unwrap,
  exitPool,
  faucet,
  freezeLot,
  openDisputeAsSender,
  resolveDispute,
  setPaused,
  por,
  remainingMs,
  lotStatus,
  migrateState,
  supply,
  transferable,
  DEMO_ADDRESSES,
  DEFAULT_ROLES,
  hasRole,
  requireRole,
};

export {
  safeModeSnapshot,
  viewLots,
  SAFE_MODE_COPY,
} from "./safe-mode";
export type { SafeModeSnapshot, LotView, SafeModeActions } from "./safe-mode";

export { KeelApi, KeelHttpError } from "./http";
export type { KeelHttpOptions, ActionBody } from "./http";

export {
  safeDeposit,
  safeWithdraw,
  settleProtocolLots,
  unwrapUser,
  claimSafeDeposit,
  SAFE_DEPOSIT_COPY,
} from "./safe-deposit";
export type {
  SafeDepositParams,
  SafeDepositResult,
  SafeWithdrawParams,
} from "./safe-deposit";

export {
  RETENTION_PROFILES,
  RETENTION_COPY,
  resolveRetentionWindow,
  formatRetentionHuman,
} from "../../../src/lib/keel/retention";
export type { RetentionProfile, RetentionProfileId } from "../../../src/lib/keel/retention";

export type KeelNetwork = "demo" | "testnet" | "mainnet";

/** @deprecated Prefer BindClient alias — same class. */
export class KeelClient {
  constructor(
    public readonly network: KeelNetwork = "demo",
    public state = createInitialState(),
  ) {}

  static demo() {
    return new KeelClient("demo");
  }

  reserves() {
    return por(this.state);
  }

  wrap(address: string, amount: number) {
    this.state = deposit(this.state, address, amount);
    return this.state;
  }

  send(from: string, to: string, amount: number) {
    this.state = transfer(this.state, from, to, amount);
    return this.state;
  }

  settleAccount(address: string) {
    this.state = settle(this.state, address);
    return this.state;
  }

  settleAllReady() {
    this.state = settleAll(this.state);
    return this.state;
  }

  unwrapToUsdc(address: string, amount: number) {
    this.state = unwrap(this.state, address, amount);
    return this.state;
  }

  exit(address: string, amount: number) {
    this.state = exitPool(this.state, address, amount);
    return this.state;
  }

  pause(actor = DEFAULT_ROLES.pauser) {
    this.state = setPaused(this.state, true, actor);
    return this.state;
  }

  unpause(actor = DEFAULT_ROLES.pauser) {
    this.state = setPaused(this.state, false, actor);
    return this.state;
  }

  resolve(disputeId: string, approve: boolean, actor = DEFAULT_ROLES.recoverer) {
    this.state = resolveDispute(this.state, disputeId, approve, actor);
    return this.state;
  }

  freeze(holder: string, lotId: string, actor = DEFAULT_ROLES.freezer) {
    this.state = freezeLot(this.state, holder, lotId, actor);
    return this.state;
  }

  /** Switch Retention Cover lane (standard 12h vs KYC Fast Lane). */
  setRetention(
    profile: "standard" | "kyc_fast_lane",
    opts?: { kycAttested?: boolean; demoMode?: boolean },
  ) {
    this.state = applyRetentionProfile(this.state, profile, opts);
    return this.state;
  }
}

/** Product brand alias for partners. */
export class BindClient extends KeelClient {
  static override demo() {
    return new BindClient("demo");
  }
}
