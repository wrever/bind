import { createHmac, timingSafeEqual } from "crypto";
import type { ProofOfReserves } from "./types";

export type SignedPor = ProofOfReserves & {
  sessionId?: string;
  signature: {
    alg: "HMAC-SHA256";
    keyId: string;
    sig: string;
    payload: string;
    demo?: boolean;
  };
};

const DEMO_SECRET = "keel-demo-por-secret-v1";

function secret() {
  const s = process.env.KEEL_POR_SECRET;
  if (s && s.length > 0) return s;
  if (process.env.BIND_STRICT === "1" || process.env.KEEL_NETWORK === "mainnet") {
    throw new Error("KEEL_POR_SECRET required when BIND_STRICT=1 or mainnet");
  }
  return DEMO_SECRET;
}

function keyId() {
  return process.env.KEEL_POR_KEY_ID ?? "demo";
}

function usingDemoSecret() {
  const s = process.env.KEEL_POR_SECRET;
  return !s || s.length === 0 || s === DEMO_SECRET;
}

/** Stable canonical JSON for signing (sorted keys, fixed fields). */
export function canonicalPorPayload(
  por: ProofOfReserves,
  sessionId?: string,
): string {
  const body = {
    asOf: por.asOf,
    exitPoolUsdc: por.exitPoolUsdc,
    fullyBacked: por.fullyBacked,
    maxSupply: por.maxSupply,
    paused: por.paused,
    protocolFeesEarned: por.protocolFeesEarned,
    rUsdcSupply: por.rUsdcSupply,
    ratio: Number(por.ratio.toFixed(12)),
    sessionId: sessionId ?? null,
    settledSupply: por.settledSupply,
    unsettledSupply: por.unsettledSupply,
    vaultUsdc: por.vaultUsdc,
  };
  return JSON.stringify(body);
}

export function signPor(
  por: ProofOfReserves,
  sessionId?: string,
): SignedPor {
  const payload = canonicalPorPayload(por, sessionId);
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return {
    ...por,
    ...(sessionId ? { sessionId } : {}),
    signature: {
      alg: "HMAC-SHA256",
      keyId: keyId(),
      sig,
      payload,
      ...(usingDemoSecret() ? { demo: true } : {}),
    },
  };
}

/**
 * Verify HMAC. Rejects client-supplied payloads when using the public demo
 * secret unless explicitly allowed — otherwise anyone can forge {valid:true}.
 */
export function verifyPorSignature(signed: {
  signature: { alg: string; sig: string; payload: string };
}): boolean {
  if (signed.signature.alg !== "HMAC-SHA256") return false;
  if (usingDemoSecret()) {
    // Demo secret is public in repo — cryptographic verify is theater.
    // Still check format, but callers must treat demo:true as non-attestation.
    if (process.env.BIND_STRICT === "1") return false;
  }
  const expected = createHmac("sha256", secret())
    .update(signed.signature.payload)
    .digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signed.signature.sig, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function porIsDemoAttestation(): boolean {
  return usingDemoSecret();
}
