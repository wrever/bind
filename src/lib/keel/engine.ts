import type {
  Address,
  Account,
  Dispute,
  KeelConfig,
  KeelEvent,
  KeelState,
  ProofOfReserves,
  UnsettledLot,
} from "./types";
import { DEFAULT_ROLES, migrateRoles, requireRole } from "./roles";
import {
  resolveRetentionWindow,
  RETENTION_PROFILES,
  type RetentionProfileId,
} from "./retention";

/** Demo defaults use compressed retention; prod uses profile.windowMs (12h / 1h). */
const DEFAULT_CONFIG: KeelConfig = {
  windowMs: RETENTION_PROFILES.standard.demoWindowMs,
  retentionProfile: "standard",
  demoMode: true,
  kycAttested: false,
  allowExitPool: true,
  exitFeeBps: 30,
  maxSupply: 1_000_000,
  maxUnsettledPerLot: 10_000,
  maxUnsettledSupply: 500_000,
  maxClaimAmount: 10_000,
  maxOpenClaimsPerAccount: 3,
  assetSymbol: "rUSDC",
  baseSymbol: "USDC",
};

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureAccount(state: KeelState, address: Address): Account {
  if (!state.accounts[address]) {
    state.accounts[address] = {
      address,
      usdc: 0,
      settled: 0,
      unsettled: [],
    };
  }
  return state.accounts[address];
}

function push(state: KeelState, event: KeelEvent) {
  state.events = [event, ...state.events].slice(0, 120);
}

function unsettledTotal(account: Account) {
  return account.unsettled.reduce((s, l) => s + l.amount, 0);
}

export function supply(state: KeelState) {
  let settled = 0;
  let unsettled = 0;
  for (const a of Object.values(state.accounts)) {
    settled += a.settled;
    unsettled += unsettledTotal(a);
  }
  return { settled, unsettled, total: settled + unsettled };
}

export function transferable(account: Account) {
  return (
    account.settled +
    account.unsettled.filter((l) => !l.frozen).reduce((s, l) => s + l.amount, 0)
  );
}

/** Migrate older persisted demo states. */
export function migrateState(raw: KeelState): KeelState {
  const state = structuredClone(raw);
  state.config = {
    ...DEFAULT_CONFIG,
    ...state.config,
    retentionProfile:
      state.config?.retentionProfile ?? DEFAULT_CONFIG.retentionProfile,
    demoMode: state.config?.demoMode ?? DEFAULT_CONFIG.demoMode,
    kycAttested: state.config?.kycAttested ?? DEFAULT_CONFIG.kycAttested,
    allowExitPool: state.config?.allowExitPool ?? DEFAULT_CONFIG.allowExitPool,
    maxSupply: state.config?.maxSupply ?? DEFAULT_CONFIG.maxSupply,
    maxUnsettledPerLot:
      state.config?.maxUnsettledPerLot ?? DEFAULT_CONFIG.maxUnsettledPerLot,
    maxUnsettledSupply:
      state.config?.maxUnsettledSupply ?? DEFAULT_CONFIG.maxUnsettledSupply,
    maxClaimAmount:
      state.config?.maxClaimAmount ?? DEFAULT_CONFIG.maxClaimAmount,
    maxOpenClaimsPerAccount:
      state.config?.maxOpenClaimsPerAccount ??
      DEFAULT_CONFIG.maxOpenClaimsPerAccount,
  };
  state.protocolFeesEarned = state.protocolFeesEarned ?? 0;
  state.paused = state.paused ?? false;
  state.exitPoolUsdc = state.exitPoolUsdc ?? 25_000;
  state.disputes = state.disputes ?? [];
  state.events = state.events ?? [];
  state.accounts = state.accounts ?? {};
  state.roles = migrateRoles(state.roles);
  for (const acc of Object.values(state.accounts)) {
    acc.unsettled = acc.unsettled ?? [];
    acc.settled = acc.settled ?? 0;
    acc.usdc = acc.usdc ?? 0;
  }
  return state;
}

export function createInitialState(overrides?: Partial<KeelConfig>): KeelState {
  const merged = { ...DEFAULT_CONFIG, ...overrides };
  const profileId = merged.retentionProfile;
  if (profileId === "kyc_fast_lane") {
    merged.kycAttested = overrides?.kycAttested ?? true;
  }
  const config: KeelConfig = {
    ...merged,
    windowMs:
      overrides?.windowMs ??
      resolveRetentionWindow(profileId, merged.demoMode),
    allowExitPool:
      overrides?.allowExitPool ??
      RETENTION_PROFILES[profileId].allowExitPool,
  };
  const state: KeelState = {
    config,
    vaultUsdc: 0,
    accounts: {},
    disputes: [],
    events: [],
    exitPoolUsdc: 25_000,
    protocolFeesEarned: 0,
    paused: false,
    roles: { ...DEFAULT_ROLES },
  };

  const alice = ensureAccount(state, "alice");
  const bob = ensureAccount(state, "bob");
  const merchant = ensureAccount(state, "merchant");
  alice.usdc = 10_000;
  bob.usdc = 2_000;
  merchant.usdc = 500;

  return state;
}

export function getAccount(state: KeelState, address: Address): Account {
  return ensureAccount(state, address);
}

export function por(state: KeelState): ProofOfReserves {
  const { settled, unsettled, total } = supply(state);
  const ratio = total === 0 ? 1 : state.vaultUsdc / total;
  return {
    vaultUsdc: state.vaultUsdc,
    rUsdcSupply: total,
    settledSupply: settled,
    unsettledSupply: unsettled,
    fullyBacked: state.vaultUsdc + 1e-9 >= total,
    ratio,
    asOf: Date.now(),
    paused: state.paused,
    protocolFeesEarned: state.protocolFeesEarned,
    exitPoolUsdc: state.exitPoolUsdc,
    maxSupply: state.config.maxSupply,
  };
}

export function lotStatus(lot: UnsettledLot, now: number, windowMs: number) {
  if (lot.frozen) return "frozen" as const;
  const remaining = Math.max(0, windowMs - (now - lot.receivedAt));
  if (remaining === 0) return "ready" as const;
  return "unsettled" as const;
}

export function remainingMs(lot: UnsettledLot, now: number, windowMs: number) {
  return Math.max(0, windowMs - (now - lot.receivedAt));
}

function assertActive(state: KeelState) {
  if (state.paused) throw new Error("Protocol paused");
}

function assertAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive finite number");
  }
}

export function setPaused(
  state: KeelState,
  paused: boolean,
  actor: Address = DEFAULT_ROLES.pauser,
): KeelState {
  const next = clone(state);
  requireRole(next.roles, actor, "pauser");
  next.paused = paused;
  push(next, { type: "pause", at: Date.now(), paused });
  return next;
}

/** Faucet more demo USDC (not on-chain). Allowed even when paused. */
export function faucet(state: KeelState, address: Address, amount: number): KeelState {
  assertAmount(amount);
  const next = clone(state);
  ensureAccount(next, address).usdc += amount;
  return next;
}

/** Deposit USDC → mint settled rUSDC 1:1 into vault. */
export function deposit(state: KeelState, address: Address, amount: number): KeelState {
  assertActive(state);
  assertAmount(amount);
  const next = clone(state);
  const { total } = supply(next);
  if (next.config.maxSupply > 0 && total + amount > next.config.maxSupply) {
    throw new Error(
      `Supply cap exceeded (max ${next.config.maxSupply} rUSDC)`,
    );
  }
  const acc = ensureAccount(next, address);
  if (acc.usdc < amount) throw new Error("Insufficient USDC");
  acc.usdc -= amount;
  next.vaultUsdc += amount;
  acc.settled += amount;
  push(next, { type: "deposit", at: Date.now(), address, amount });
  assertPeg(next);
  return next;
}

function assertLotCaps(state: KeelState, amount: number) {
  if (
    state.config.maxUnsettledPerLot > 0 &&
    amount > state.config.maxUnsettledPerLot
  ) {
    throw new Error(
      `Lot exceeds maxUnsettledPerLot (${state.config.maxUnsettledPerLot})`,
    );
  }
  if (state.config.maxUnsettledSupply > 0) {
    const { unsettled } = supply(state);
    if (unsettled + amount > state.config.maxUnsettledSupply) {
      throw new Error(
        `Unsettled supply cap exceeded (max ${state.config.maxUnsettledSupply})`,
      );
    }
  }
}

function assertClaimCaps(
  state: KeelState,
  claimant: Address,
  amount: number,
) {
  if (state.config.maxClaimAmount > 0 && amount > state.config.maxClaimAmount) {
    throw new Error(
      `Claim exceeds maxClaimAmount (${state.config.maxClaimAmount})`,
    );
  }
  const open = state.disputes.filter(
    (d) => d.status === "open" && d.claimant === claimant,
  ).length;
  if (
    state.config.maxOpenClaimsPerAccount > 0 &&
    open >= state.config.maxOpenClaimsPerAccount
  ) {
    throw new Error(
      `Too many open claims for ${claimant} (max ${state.config.maxOpenClaimsPerAccount})`,
    );
  }
}

/**
 * Transfer covered credit. Debits sender (settled first, then oldest non-frozen unsettled).
 * Receiver always gets a new unsettled lot (starts Bind cover window).
 */
export function transfer(
  state: KeelState,
  from: Address,
  to: Address,
  amount: number,
): KeelState {
  assertActive(state);
  if (from === to) throw new Error("Cannot transfer to self");
  assertAmount(amount);
  assertLotCaps(state, amount);
  const next = clone(state);
  const sender = ensureAccount(next, from);
  const receiver = ensureAccount(next, to);
  if (transferable(sender) < amount) throw new Error("Insufficient rUSDC");

  debitRUsdc(sender, amount);

  receiver.unsettled.push({
    id: id("lot"),
    amount,
    receivedAt: Date.now(),
    frozen: false,
    from,
  });

  push(next, { type: "transfer", at: Date.now(), from, to, amount });
  assertPeg(next);
  return next;
}

function debitRUsdc(sender: Account, amount: number) {
  let left = amount;
  const fromSettled = Math.min(sender.settled, left);
  sender.settled -= fromSettled;
  left -= fromSettled;
  if (left <= 0) return;

  sender.unsettled.sort((a, b) => a.receivedAt - b.receivedAt);
  const keep: UnsettledLot[] = [];
  for (const lot of sender.unsettled) {
    if (left <= 0 || lot.frozen) {
      keep.push(lot);
      continue;
    }
    if (lot.amount <= left) {
      left -= lot.amount;
    } else {
      keep.push({ ...lot, amount: lot.amount - left });
      left = 0;
    }
  }
  if (left > 0) throw new Error("Insufficient transferable rUSDC");
  sender.unsettled = keep;
}

/** Move expired non-frozen unsettled lots → settled. Permissionless. */
export function settle(
  state: KeelState,
  address: Address,
  now = Date.now(),
): KeelState {
  // settle allowed while paused (unlock users)
  const next = clone(state);
  const moved = settleAccount(next, address, now);
  if (moved > 0) {
    push(next, { type: "settle", at: now, address, amount: moved });
  }
  assertPeg(next);
  return next;
}

function settleAccount(state: KeelState, address: Address, now: number) {
  const acc = ensureAccount(state, address);
  let moved = 0;
  const remain: UnsettledLot[] = [];
  for (const lot of acc.unsettled) {
    if (!lot.frozen && now - lot.receivedAt >= state.config.windowMs) {
      acc.settled += lot.amount;
      moved += lot.amount;
    } else {
      remain.push(lot);
    }
  }
  acc.unsettled = remain;
  return moved;
}

/** Keeper: settle every account with ready lots. */
export function settleAll(state: KeelState, now = Date.now()): KeelState {
  const next = clone(state);
  let totalMoved = 0;
  let touched = 0;
  for (const address of Object.keys(next.accounts)) {
    const moved = settleAccount(next, address, now);
    if (moved > 0) {
      totalMoved += moved;
      touched += 1;
      push(next, { type: "settle", at: now, address, amount: moved });
    }
  }
  if (totalMoved > 0) {
    push(next, {
      type: "settle_all",
      at: now,
      amount: totalMoved,
      accounts: touched,
    });
  }
  assertPeg(next);
  return next;
}

/**
 * Switch retention profile (standard 12h vs KYC Fast Lane).
 * Demo mode keeps compressed clocks; prod uses real hours.
 */
export function applyRetentionProfile(
  state: KeelState,
  profileId: RetentionProfileId,
  opts?: { kycAttested?: boolean; demoMode?: boolean },
): KeelState {
  const next = clone(state);
  const profile = RETENTION_PROFILES[profileId];
  if (profile.kycRequired && !(opts?.kycAttested ?? next.config.kycAttested)) {
    throw new Error("KYC Fast Lane requires partner KYC attestation");
  }
  const demoMode = opts?.demoMode ?? next.config.demoMode;
  next.config = {
    ...next.config,
    retentionProfile: profileId,
    demoMode,
    kycAttested:
      profileId === "kyc_fast_lane"
        ? true
        : (opts?.kycAttested ?? next.config.kycAttested),
    windowMs: resolveRetentionWindow(profileId, demoMode),
    allowExitPool: profile.allowExitPool,
  };
  return next;
}

/** Burn settled rUSDC → release USDC from vault. Unsettled cannot unwrap (retention). */
export function unwrap(
  state: KeelState,
  address: Address,
  amount: number,
): KeelState {
  assertActive(state);
  assertAmount(amount);
  const next = clone(state);
  const acc = ensureAccount(next, address);
  if (acc.settled < amount) {
    throw new Error(
      "Retention: free unwrap needs settled credit — wait for T, or Exit Pool (paid)",
    );
  }
  if (next.vaultUsdc < amount) throw new Error("Vault underfunded");
  acc.settled -= amount;
  next.vaultUsdc -= amount;
  acc.usdc += amount;
  push(next, { type: "unwrap", at: Date.now(), address, amount });
  assertPeg(next);
  return next;
}

/**
 * Instantly convert unsettled → USDC via Exit Pool (pays fee).
 * Frozen lots cannot be exited.
 */
export function exitPool(
  state: KeelState,
  address: Address,
  amount: number,
): KeelState {
  assertActive(state);
  assertAmount(amount);
  if (!state.config.allowExitPool) {
    throw new Error(
      "Exit Pool disabled for this retention profile — wait for settle or file a claim",
    );
  }
  const next = clone(state);
  const acc = ensureAccount(next, address);
  const fee = round2((amount * next.config.exitFeeBps) / 10_000);
  const payout = round2(amount - fee);
  if (payout <= 0) throw new Error("Fee consumes entire amount");
  if (next.exitPoolUsdc + 1e-9 < payout) {
    throw new Error("Exit Pool lacks liquidity");
  }

  debitUnsettledOnly(acc, amount);

  // Burn backing from vault; Exit Pool underwrites payout and is reimbursed + fee.
  next.vaultUsdc = round2(next.vaultUsdc - amount);
  next.exitPoolUsdc = round2(next.exitPoolUsdc - payout + amount);
  next.protocolFeesEarned = round2(next.protocolFeesEarned + fee);
  acc.usdc = round2(acc.usdc + payout);

  push(next, {
    type: "exit_pool",
    at: Date.now(),
    address,
    amount,
    fee,
  });
  assertPeg(next);
  return next;
}

function debitUnsettledOnly(acc: Account, amount: number) {
  let left = amount;
  acc.unsettled.sort((a, b) => a.receivedAt - b.receivedAt);
  const keep: UnsettledLot[] = [];
  for (const lot of acc.unsettled) {
    if (left <= 0 || lot.frozen) {
      keep.push(lot);
      continue;
    }
    if (lot.amount <= left) {
      left = round2(left - lot.amount);
    } else {
      keep.push({ ...lot, amount: round2(lot.amount - left) });
      left = 0;
    }
  }
  if (left > 1e-9) throw new Error("Insufficient unsettled rUSDC");
  acc.unsettled = keep;
}

/** Ops freezer: freeze a lot on a holder without being the original sender. */
export function freezeLot(
  state: KeelState,
  holder: Address,
  lotId: string,
  actor: Address = DEFAULT_ROLES.freezer,
  reason = "Ops freeze",
): KeelState {
  const next = clone(state);
  requireRole(next.roles, actor, "freezer");
  const acc = ensureAccount(next, holder);
  const lot = acc.unsettled.find((l) => l.id === lotId);
  if (!lot) throw new Error("Lot not found on holder");
  if (lot.frozen) throw new Error("Lot already frozen");
  assertClaimCaps(next, lot.from, lot.amount);
  lot.frozen = true;
  const dispute: Dispute = {
    id: id("dsp"),
    claimant: lot.from,
    lotId,
    amount: lot.amount,
    reason: reason.trim() || "Ops freeze",
    status: "open",
    createdAt: Date.now(),
  };
  next.disputes = [dispute, ...next.disputes];
  push(next, { type: "freeze", at: Date.now(), lotId, address: holder });
  push(next, {
    type: "dispute_open",
    at: Date.now(),
    disputeId: dispute.id,
    claimant: dispute.claimant,
  });
  return next;
}

export function openDispute(
  state: KeelState,
  claimant: Address,
  lotId: string,
  reason: string,
): KeelState {
  const next = clone(state);
  const acc = ensureAccount(next, claimant);
  const lot = acc.unsettled.find((l) => l.id === lotId);
  if (!lot) throw new Error("Lot not found on claimant");
  if (lot.frozen) throw new Error("Lot already frozen");
  assertClaimCaps(next, claimant, lot.amount);
  lot.frozen = true;
  const dispute: Dispute = {
    id: id("dsp"),
    claimant,
    lotId,
    amount: lot.amount,
    reason: reason.trim() || "Unauthorized transfer / theft",
    status: "open",
    createdAt: Date.now(),
  };
  next.disputes = [dispute, ...next.disputes];
  push(next, { type: "freeze", at: Date.now(), lotId, address: claimant });
  push(next, {
    type: "dispute_open",
    at: Date.now(),
    disputeId: dispute.id,
    claimant,
  });
  return next;
}

/** Sender opens dispute on a lot currently held by receiver. */
export function openDisputeAsSender(
  state: KeelState,
  sender: Address,
  receiver: Address,
  lotId: string,
  reason: string,
): KeelState {
  const next = clone(state);
  const recv = ensureAccount(next, receiver);
  const lot = recv.unsettled.find((l) => l.id === lotId);
  if (!lot) throw new Error("Lot not found on receiver");
  if (lot.from !== sender) {
    throw new Error("Only original sender can dispute this lot");
  }
  if (lot.frozen) throw new Error("Lot already frozen");
  assertClaimCaps(next, sender, lot.amount);
  lot.frozen = true;
  const dispute: Dispute = {
    id: id("dsp"),
    claimant: sender,
    lotId,
    amount: lot.amount,
    reason: reason.trim() || "Unauthorized transfer / theft",
    status: "open",
    createdAt: Date.now(),
  };
  next.disputes = [dispute, ...next.disputes];
  push(next, { type: "freeze", at: Date.now(), lotId, address: receiver });
  push(next, {
    type: "dispute_open",
    at: Date.now(),
    disputeId: dispute.id,
    claimant: sender,
  });
  return next;
}

export function resolveDispute(
  state: KeelState,
  disputeId: string,
  approve: boolean,
  actor: Address = DEFAULT_ROLES.recoverer,
): KeelState {
  const next = clone(state);
  requireRole(next.roles, actor, "recoverer");
  const dispute = next.disputes.find((d) => d.id === disputeId);
  if (!dispute) throw new Error("Dispute not found");
  if (dispute.status !== "open") throw new Error("Dispute already resolved");

  let holder: Account | undefined;
  let lot: UnsettledLot | undefined;
  for (const acc of Object.values(next.accounts)) {
    const found = acc.unsettled.find((l) => l.id === dispute.lotId);
    if (found) {
      holder = acc;
      lot = found;
      break;
    }
  }
  if (!holder || !lot) throw new Error("Frozen lot missing");

  if (approve) {
    holder.unsettled = holder.unsettled.filter((l) => l.id !== lot!.id);
    const victim = ensureAccount(next, dispute.claimant);
    victim.settled = round2(victim.settled + lot.amount);
    dispute.status = "approved";
    push(next, {
      type: "recover",
      at: Date.now(),
      lotId: lot.id,
      from: holder.address,
      to: victim.address,
      amount: lot.amount,
    });
  } else {
    lot.frozen = false;
    dispute.status = "rejected";
  }
  dispute.resolvedAt = Date.now();
  push(next, {
    type: "dispute_resolve",
    at: Date.now(),
    disputeId,
    status: dispute.status === "approved" ? "approved" : "rejected",
  });
  assertPeg(next);
  return next;
}

function assertPeg(state: KeelState) {
  const { total } = supply(state);
  if (state.vaultUsdc + 1e-6 < total) {
    throw new Error(`Peg broken: vault ${state.vaultUsdc} < supply ${total}`);
  }
}

function round2(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function clone(state: KeelState): KeelState {
  return migrateState(structuredClone(state));
}

export const DEMO_ADDRESSES = ["alice", "bob", "merchant"] as const;
