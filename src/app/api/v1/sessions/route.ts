import { createSession } from "@/lib/keel/store";
import { jsonOk, readBody } from "@/lib/keel/http";
import { por } from "@/lib/keel/engine";
import { RETENTION_PROFILES } from "@/lib/keel/retention";
import type { RetentionProfileId } from "@/lib/keel/types";

export const dynamic = "force-dynamic";

/** Create a demo session with Retention Cover profile (standard | kyc_fast_lane). */
export async function POST(req: Request) {
  const body = await readBody(req);
  const windowMs =
    typeof body.windowMs === "number" ? body.windowMs : undefined;
  const rawProfile = String(body.retentionProfile ?? body.profile ?? "standard");
  const retentionProfile = (
    rawProfile === "kyc_fast_lane" ? "kyc_fast_lane" : "standard"
  ) as RetentionProfileId;
  const demoMode =
    body.demoMode === undefined ? true : Boolean(body.demoMode);
  const kycAttested =
    body.kycAttested === undefined
      ? retentionProfile === "kyc_fast_lane"
      : Boolean(body.kycAttested);

  const session = await createSession({
    windowMs,
    retentionProfile,
    demoMode,
    kycAttested,
  });
  const profile = RETENTION_PROFILES[session.state.config.retentionProfile];
  return jsonOk({
    sessionId: session.id,
    createdAt: session.createdAt,
    config: session.state.config,
    retention: {
      profile: profile.id,
      label: profile.label,
      badge: profile.badge,
      blurb: profile.blurb,
      freeExitBlocked: true,
      productionWindowMs: profile.windowMs,
      activeWindowMs: session.state.config.windowMs,
    },
    por: por(session.state),
    actors: Object.keys(session.state.accounts),
  });
}
