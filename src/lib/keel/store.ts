import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import {
  applyRetentionProfile,
  createInitialState,
  deposit,
  exitPool,
  faucet,
  freezeLot,
  migrateState,
  openDisputeAsSender,
  por,
  resolveDispute,
  setPaused,
  settle,
  settleAll,
  transfer,
  unwrap,
} from "./engine";
import { DEFAULT_RULES, consume } from "./rate-limit";
import { DEFAULT_ROLES } from "./roles";
import { getSupabase, supabaseEnabled } from "./supabase";
import type { KeelState, ProofOfReserves, RetentionProfileId } from "./types";
import { RETENTION_PROFILES } from "./retention";

export type CreateSessionOpts = {
  windowMs?: number;
  retentionProfile?: RetentionProfileId;
  demoMode?: boolean;
  kycAttested?: boolean;
  allowExitPool?: boolean;
};

export type SessionRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;
  state: KeelState;
};

export type PersistenceBackend = "memory+file" | "supabase+file";

const g = globalThis as unknown as {
  __keelSessions?: Map<string, SessionRecord>;
  __keelHydrate?: Promise<void>;
  __keelHydrated?: boolean;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");

function sessions() {
  if (!g.__keelSessions) {
    g.__keelSessions = new Map();
    loadFromDisk();
  }
  return g.__keelSessions;
}

function loadFromDisk() {
  try {
    if (!existsSync(DATA_FILE)) return;
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as SessionRecord[];
    for (const rec of raw) {
      rec.state = migrateState(rec.state);
      g.__keelSessions!.set(rec.id, rec);
    }
  } catch {
    /* ignore corrupt store */
  }
}

function rowToRecord(row: {
  id: string;
  state: KeelState;
  created_at?: string;
  updated_at?: string;
}): SessionRecord {
  return {
    id: row.id,
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    state: migrateState(row.state),
  };
}

async function hydrateFromSupabase() {
  if (!supabaseEnabled()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb
      .from("keel_sessions")
      .select("id,state,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error || !data) return;
    const map = sessions();
    for (const row of data) {
      const rec = rowToRecord(row as Parameters<typeof rowToRecord>[0]);
      const existing = map.get(rec.id);
      if (!existing || rec.updatedAt >= existing.updatedAt) {
        map.set(rec.id, rec);
      }
    }
    // Mirror remote → local file for cold starts without env
    persistDiskOnly();
  } catch {
    /* non-fatal */
  }
}

/** Ensure disk + optional Supabase hydrate ran once per process. */
export function ensureStoreReady(): Promise<void> {
  sessions();
  if (g.__keelHydrated) return Promise.resolve();
  if (!g.__keelHydrate) {
    g.__keelHydrate = hydrateFromSupabase().finally(() => {
      g.__keelHydrated = true;
    });
  }
  return g.__keelHydrate;
}

export function persistenceBackend(): PersistenceBackend {
  return supabaseEnabled() ? "supabase+file" : "memory+file";
}

export function sessionCount(): number {
  return sessions().size;
}

function persistDiskOnly() {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const all = [...sessions().values()];
    writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
  } catch {
    /* non-fatal in readonly envs */
  }
}

function persist() {
  persistDiskOnly();
  void persistSupabase();
}

async function persistSupabase() {
  if (!supabaseEnabled()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const rows = [...sessions().values()].map((r) => ({
      id: r.id,
      state: r.state,
      created_at: new Date(r.createdAt).toISOString(),
      updated_at: new Date(r.updatedAt).toISOString(),
    }));
    if (rows.length === 0) return;
    await sb.from("keel_sessions").upsert(rows, { onConflict: "id" });
  } catch {
    /* non-fatal */
  }
}

async function fetchSessionRemote(id: string): Promise<SessionRecord | null> {
  if (!supabaseEnabled()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("keel_sessions")
      .select("id,state,created_at,updated_at")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const rec = rowToRecord(data as Parameters<typeof rowToRecord>[0]);
    sessions().set(rec.id, rec);
    persistDiskOnly();
    return rec;
  } catch {
    return null;
  }
}

async function logClaimEvent(
  sessionId: string,
  action: string,
  actor: string | undefined,
  body: Record<string, unknown>,
) {
  if (!supabaseEnabled()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("keel_claim_events").insert({
      session_id: sessionId,
      action,
      actor: actor ?? null,
      lot_id: body.lotId ? String(body.lotId) : null,
      payload: body,
    });
  } catch {
    /* non-fatal */
  }
}

export async function persistPorSnapshot(
  sessionId: string,
  reserves: ProofOfReserves,
) {
  if (!supabaseEnabled()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("keel_por_snapshots").insert({
      session_id: sessionId,
      network: process.env.KEEL_NETWORK ?? "demo",
      vault_usdc: reserves.vaultUsdc,
      supply: reserves.rUsdcSupply,
      fully_backed: reserves.fullyBacked,
      payload: reserves,
    });
  } catch {
    /* non-fatal */
  }
}

export async function listClaimEvents(sessionId: string, limit = 40) {
  await ensureStoreReady();
  if (!supabaseEnabled()) {
    const rec = sessions().get(sessionId);
    if (!rec) return [];
    return rec.state.events.slice(0, limit).map((e, i) => ({
      id: `local_${i}`,
      session_id: sessionId,
      action: e.type,
      actor: null as string | null,
      lot_id: null as string | null,
      payload: e,
      created_at: new Date(e.at).toISOString(),
    }));
  }
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("keel_claim_events")
      .select("id,session_id,action,actor,lot_id,payload,created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

function sid() {
  return `sess_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createSession(
  opts?: number | CreateSessionOpts,
): Promise<SessionRecord> {
  await ensureStoreReady();
  const normalized: CreateSessionOpts =
    typeof opts === "number" ? { windowMs: opts } : (opts ?? {});
  const profile = normalized.retentionProfile ?? "standard";
  const id = sid();
  const rec: SessionRecord = {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: createInitialState({
      retentionProfile: profile,
      demoMode: normalized.demoMode ?? true,
      kycAttested:
        normalized.kycAttested ?? profile === "kyc_fast_lane",
      allowExitPool:
        normalized.allowExitPool ?? RETENTION_PROFILES[profile].allowExitPool,
      ...(normalized.windowMs !== undefined
        ? { windowMs: normalized.windowMs }
        : {}),
    }),
  };
  sessions().set(id, rec);
  persist();
  return rec;
}

/** Sync peek — prefer resolveSession after boot. */
export function getSession(id: string): SessionRecord | null {
  const rec = sessions().get(id);
  if (!rec) return null;
  rec.state = migrateState(rec.state);
  return rec;
}

/** Resolve session from memory, then Supabase if missing. */
export async function resolveSession(id: string): Promise<SessionRecord | null> {
  await ensureStoreReady();
  const local = getSession(id);
  if (local) return local;
  return fetchSessionRemote(id);
}

export async function requireSession(id: string): Promise<SessionRecord> {
  const s = await resolveSession(id);
  if (!s) throw new Error("Session not found");
  return s;
}

function commit(rec: SessionRecord, state: KeelState): SessionRecord {
  rec.state = migrateState(state);
  rec.updatedAt = Date.now();
  sessions().set(rec.id, rec);
  persist();
  return rec;
}

export async function sessionPor(id: string): Promise<ProofOfReserves> {
  const rec = await requireSession(id);
  return por(rec.state);
}

export type ActionName =
  | "faucet"
  | "deposit"
  | "transfer"
  | "settle"
  | "settle_all"
  | "unwrap"
  | "exit"
  | "dispute"
  | "resolve"
  | "freeze"
  | "pause"
  | "unpause"
  | "set_retention";

function enforceRateLimit(
  sessionId: string,
  action: string,
  subject: string,
) {
  const rule = DEFAULT_RULES[action];
  if (!rule) return;
  const key = `${sessionId}:${action}:${subject}`;
  const result = consume(key, rule);
  if (!result.ok) {
    throw new Error(
      `Rate limit exceeded for ${action} (max ${result.limit}/window). Retry in ${Math.ceil(result.retryAfterMs / 1000)}s`,
    );
  }
}

function actorOf(body: Record<string, unknown>, fallback: string) {
  const a = body.actor ?? body.as;
  return a !== undefined && a !== null && String(a).length > 0
    ? String(a)
    : fallback;
}

export async function applyAction(
  sessionId: string,
  action: ActionName,
  body: Record<string, unknown>,
): Promise<SessionRecord> {
  const rec = await requireSession(sessionId);
  let next = rec.state;

  switch (action) {
    case "faucet":
      next = faucet(next, String(body.address), Number(body.amount));
      break;
    case "deposit":
      next = deposit(next, String(body.address), Number(body.amount));
      break;
    case "transfer": {
      const from = String(body.from);
      enforceRateLimit(sessionId, "transfer", from);
      next = transfer(next, from, String(body.to), Number(body.amount));
      break;
    }
    case "settle":
      next = settle(next, String(body.address));
      break;
    case "settle_all":
      next = settleAll(next);
      break;
    case "unwrap":
      next = unwrap(next, String(body.address), Number(body.amount));
      break;
    case "exit":
      next = exitPool(next, String(body.address), Number(body.amount));
      break;
    case "dispute": {
      const from = String(body.from);
      enforceRateLimit(sessionId, "dispute", from);
      next = openDisputeAsSender(
        next,
        from,
        String(body.to),
        String(body.lotId),
        String(body.reason ?? ""),
      );
      break;
    }
    case "freeze": {
      const actor = actorOf(body, DEFAULT_ROLES.freezer);
      enforceRateLimit(sessionId, "dispute", actor);
      next = freezeLot(
        next,
        String(body.to ?? body.holder),
        String(body.lotId),
        actor,
        String(body.reason ?? "Ops freeze"),
      );
      break;
    }
    case "resolve": {
      const actor = actorOf(body, DEFAULT_ROLES.recoverer);
      enforceRateLimit(sessionId, "resolve", actor);
      next = resolveDispute(
        next,
        String(body.disputeId),
        Boolean(body.approve),
        actor,
      );
      break;
    }
    case "pause":
      next = setPaused(next, true, actorOf(body, DEFAULT_ROLES.pauser));
      break;
    case "unpause":
      next = setPaused(next, false, actorOf(body, DEFAULT_ROLES.pauser));
      break;
    case "set_retention": {
      const profile = String(body.profile ?? body.retentionProfile) as RetentionProfileId;
      if (profile !== "standard" && profile !== "kyc_fast_lane") {
        throw new Error("retention profile must be standard | kyc_fast_lane");
      }
      next = applyRetentionProfile(next, profile, {
        kycAttested:
          body.kycAttested === undefined
            ? profile === "kyc_fast_lane"
            : Boolean(body.kycAttested),
        demoMode:
          body.demoMode === undefined
            ? next.config.demoMode
            : Boolean(body.demoMode),
      });
      break;
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const actor =
    typeof body.actor === "string"
      ? body.actor
      : typeof body.as === "string"
        ? body.as
        : typeof body.from === "string"
          ? body.from
          : typeof body.address === "string"
            ? body.address
            : undefined;
  void logClaimEvent(sessionId, action, actor, body);

  return commit(rec, next);
}
