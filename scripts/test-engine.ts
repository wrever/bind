import {
  createInitialState,
  deposit,
  transfer,
  settle,
  settleAll,
  unwrap,
  exitPool,
  freezeLot,
  openDisputeAsSender,
  resolveDispute,
  por,
  setPaused,
  faucet,
  supply,
  applyRetentionProfile,
} from "../src/lib/keel/engine";
import { DEFAULT_ROLES } from "../src/lib/keel/roles";
import { signPor, verifyPorSignature } from "../src/lib/keel/por-sign";
import { consume, resetRateLimits } from "../src/lib/keel/rate-limit";
import { safeModeSnapshot } from "../src/lib/keel/safe-mode";
import {
  safeDeposit,
  claimSafeDeposit,
} from "../src/lib/keel/safe-deposit";
import { RETENTION_PROFILES } from "../src/lib/keel/retention";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  // --- recover path ---
  let s = createInitialState({ windowMs: 10, maxSupply: 1_000_000 });
  s = deposit(s, "alice", 200);
  s = transfer(s, "alice", "bob", 50);
  const lot = s.accounts.bob.unsettled[0];
  assert(lot, "expected unsettled lot");
  s = openDisputeAsSender(s, "alice", "bob", lot.id, "theft");
  s = resolveDispute(s, s.disputes[0].id, true);
  assert(s.accounts.alice.settled >= 150, "recover failed");
  assert(por(s).fullyBacked, "peg after recover");

  // --- settle + unwrap ---
  s = transfer(s, "alice", "bob", 20);
  await sleep(15);
  s = settle(s, "bob");
  assert(s.accounts.bob.settled >= 20, "settle failed");
  s = unwrap(s, "bob", 20);
  assert(por(s).fullyBacked, "peg after unwrap");

  // --- exit pool fee accounting ---
  const poolBefore = s.exitPoolUsdc;
  const feesBefore = s.protocolFeesEarned;
  s = deposit(s, "alice", 100);
  s = transfer(s, "alice", "merchant", 40);
  s = exitPool(s, "merchant", 40);
  assert(s.protocolFeesEarned > feesBefore, "fees not accrued");
  assert(s.exitPoolUsdc > poolBefore - 0.001, "exit pool should retain fee");
  assert(por(s).fullyBacked, "peg after exit");

  // --- pause ---
  s = setPaused(s, true);
  let blocked = false;
  try {
    deposit(s, "alice", 1);
  } catch {
    blocked = true;
  }
  assert(blocked, "pause should block deposit");
  s = setPaused(s, false);

  // --- supply cap ---
  let capped = createInitialState({ maxSupply: 50, windowMs: 1000 });
  capped = deposit(capped, "alice", 50);
  let hitCap = false;
  try {
    deposit(capped, "alice", 1);
  } catch {
    hitCap = true;
  }
  assert(hitCap, "maxSupply should block");

  // --- settle_all keeper ---
  let k = createInitialState({ windowMs: 10 });
  k = deposit(k, "alice", 100);
  k = transfer(k, "alice", "bob", 30);
  k = transfer(k, "alice", "merchant", 20);
  await sleep(15);
  k = settleAll(k);
  assert(k.accounts.bob.settled >= 30, "bob settled");
  assert(k.accounts.merchant.settled >= 20, "merchant settled");
  assert(por(k).fullyBacked, "peg after settle_all");

  // --- frozen lot cannot exit ---
  let f = createInitialState({ windowMs: 60_000 });
  f = deposit(f, "alice", 100);
  f = transfer(f, "alice", "bob", 40);
  const lot2 = f.accounts.bob.unsettled[0];
  f = openDisputeAsSender(f, "alice", "bob", lot2.id, "theft");
  let exitBlocked = false;
  try {
    exitPool(f, "bob", 40);
  } catch {
    exitBlocked = true;
  }
  assert(exitBlocked, "frozen lot must not exit");

  // --- reject dispute unfreezes ---
  f = resolveDispute(f, f.disputes[0].id, false);
  assert(!f.accounts.bob.unsettled[0].frozen, "reject should unfreeze");

  // --- faucet while paused ok ---
  f = setPaused(f, true);
  f = faucet(f, "alice", 10);
  assert(f.accounts.alice.usdc >= 10, "faucet while paused");

  // --- roles: random actor cannot pause ---
  let roleDenied = false;
  try {
    setPaused(createInitialState(), true, "eve");
  } catch {
    roleDenied = true;
  }
  assert(roleDenied, "eve must not pause");

  // --- freezer ops path ---
  let z = createInitialState({ windowMs: 60_000 });
  z = deposit(z, "alice", 80);
  z = transfer(z, "alice", "bob", 30);
  const lotZ = z.accounts.bob.unsettled[0];
  z = freezeLot(z, "bob", lotZ.id, DEFAULT_ROLES.freezer, "ops");
  assert(z.accounts.bob.unsettled[0].frozen, "ops freeze");
  z = resolveDispute(z, z.disputes[0].id, true, DEFAULT_ROLES.recoverer);
  assert(z.accounts.alice.settled >= 80, "recoverer path");

  // --- signed PoR ---
  const signed = signPor(por(z), "sess_test");
  assert(verifyPorSignature(signed), "por signature valid");
  const tampered = {
    signature: { ...signed.signature, sig: "00".repeat(32) },
  };
  assert(!verifyPorSignature(tampered), "tampered por rejected");

  // --- rate limit ---
  resetRateLimits();
  const rule = { limit: 2, windowMs: 60_000 };
  assert(consume("t:dispute:a", rule).ok, "rl1");
  assert(consume("t:dispute:a", rule).ok, "rl2");
  assert(!consume("t:dispute:a", rule).ok, "rl3 blocked");

  // --- Safe Mode snapshot ---
  let sm = createInitialState({ windowMs: 60_000 });
  sm = deposit(sm, "alice", 100);
  sm = transfer(sm, "alice", "bob", 40);
  const snap = safeModeSnapshot(sm, "bob");
  assert(snap.unsettled === 40, "safe mode unsettled");
  assert(snap.lots.length === 1, "safe mode lots");
  assert(snap.canExitUnsettled, "safe mode exit");

  // --- Retention profiles ---
  let ret = createInitialState({ retentionProfile: "standard", demoMode: true });
  assert(
    ret.config.windowMs === RETENTION_PROFILES.standard.demoWindowMs,
    "standard demo window",
  );
  ret = applyRetentionProfile(ret, "kyc_fast_lane", { kycAttested: true });
  assert(ret.config.retentionProfile === "kyc_fast_lane", "fast lane profile");
  assert(
    ret.config.windowMs === RETENTION_PROFILES.kyc_fast_lane.demoWindowMs,
    "fast lane demo window",
  );
  let kycGate = false;
  try {
    applyRetentionProfile(createInitialState(), "kyc_fast_lane", {
      kycAttested: false,
    });
  } catch {
    kycGate = true;
  }
  assert(kycGate, "fast lane requires KYC attestation");

  let unwrapBlocked = false;
  try {
    let u = createInitialState({ windowMs: 60_000 });
    u = deposit(u, "alice", 100);
    u = transfer(u, "alice", "bob", 50);
    unwrap(u, "bob", 50);
  } catch {
    unwrapBlocked = true;
  }
  assert(unwrapBlocked, "unsettled cannot free-unwrap during retention");

  // --- Bind caps: maxUnsettledPerLot ---
  let capLot = createInitialState({
    windowMs: 60_000,
    maxUnsettledPerLot: 25,
  });
  capLot = deposit(capLot, "alice", 100);
  let lotCapHit = false;
  try {
    transfer(capLot, "alice", "bob", 26);
  } catch {
    lotCapHit = true;
  }
  assert(lotCapHit, "maxUnsettledPerLot should block");

  // --- Bind caps: maxClaimAmount ---
  let capClaim = createInitialState({
    windowMs: 60_000,
    maxClaimAmount: 10,
    maxUnsettledPerLot: 100,
  });
  capClaim = deposit(capClaim, "alice", 50);
  capClaim = transfer(capClaim, "alice", "bob", 20);
  const bigLot = capClaim.accounts.bob.unsettled[0];
  let claimCapHit = false;
  try {
    openDisputeAsSender(capClaim, "alice", "bob", bigLot.id, "theft");
  } catch {
    claimCapHit = true;
  }
  assert(claimCapHit, "maxClaimAmount should block");

  // --- Safe Deposit adapter ---
  const sd0 = createInitialState({ windowMs: 60_000 });
  const dep = safeDeposit(sd0, {
    user: "alice",
    protocol: "blend_pool",
    amount: 75,
  });
  assert(dep.lotId, "safe deposit lot");
  assert(
    dep.state.accounts.blend_pool.unsettled.some((l) => l.id === dep.lotId),
    "lot on protocol",
  );
  sd = claimSafeDeposit(
    dep.state,
    "alice",
    "blend_pool",
    dep.lotId,
    "phishing",
  );
  assert(sd.disputes[0]?.status === "open", "safe deposit claim open");

  const { total } = supply(f);
  assert(f.vaultUsdc + 1e-9 >= total, "final peg");

  console.log("ok", JSON.stringify(por(s)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
