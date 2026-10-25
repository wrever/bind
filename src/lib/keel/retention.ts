/**
 * Bind Tier 1: Retention Cover profiles.
 * Production: real hours. Demo: compressed windows that keep the same UX story.
 */

import type { RetentionProfileId } from "./types";

export type { RetentionProfileId };

export type RetentionProfile = {
  id: RetentionProfileId;
  /** User-facing label */
  label: string;
  /** Short badge copy */
  badge: string;
  /** Production retention window */
  windowMs: number;
  /** Compressed window for interactive demo */
  demoWindowMs: number;
  /** Partner must attest KYC for this lane */
  kycRequired: boolean;
  /** Early exit via Exit Pool allowed (pays fee) */
  allowExitPool: boolean;
  /** Free unwrap of unsettled never allowed; settled only */
  freeExitBlocked: true;
  blurb: string;
};

export const RETENTION_PROFILES: Record<RetentionProfileId, RetentionProfile> = {
  standard: {
    id: "standard",
    label: "Protected 12h",
    badge: "NO KYC · 12h HOLD",
    windowMs: 12 * 60 * 60 * 1000,
    demoWindowMs: 45_000,
    kycRequired: false,
    allowExitPool: true,
    freeExitBlocked: true,
    blurb:
      "No KYC. Covered funds stay unsettled ~12h. Unwrap/swap to free USDC blocked until settle. Breach in window → claim.",
  },
  kyc_fast_lane: {
    id: "kyc_fast_lane",
    label: "KYC Fast Lane",
    badge: "KYC · FAST LANE",
    windowMs: 1 * 60 * 60 * 1000,
    demoWindowMs: 15_000,
    kycRequired: true,
    allowExitPool: true,
    freeExitBlocked: true,
    blurb:
      "KYC attested by partner. Shorter retention (~1h prod) + stronger attacker attribution if funds leave the rail.",
  },
};

export function resolveRetentionWindow(
  profileId: RetentionProfileId,
  demoMode: boolean,
): number {
  const p = RETENTION_PROFILES[profileId];
  return demoMode ? p.demoWindowMs : p.windowMs;
}

export function formatRetentionHuman(windowMs: number): string {
  if (windowMs >= 3_600_000) {
    const h = windowMs / 3_600_000;
    return `${h % 1 === 0 ? h.toFixed(0) : h.toFixed(1)}h`;
  }
  if (windowMs >= 60_000) {
    return `${Math.round(windowMs / 60_000)}m`;
  }
  return `${Math.round(windowMs / 1000)}s`;
}

/** UX copy: free exit is blocked; Exit Pool is paid escape from retention. */
export const RETENTION_COPY = {
  freeExit: "Free unwrap/swap blocked while unsettled (retention).",
  paidExit: "Exit Pool = leave retention early for a fee (prices risk).",
  settle: "After T, settle → settled credit → unwrap 1:1 to USDC.",
  claim: "In-window breach → freeze → claim → indemnify on Bind rail.",
} as const;
