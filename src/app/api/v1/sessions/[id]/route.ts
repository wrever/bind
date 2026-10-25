import { resolveSession } from "@/lib/keel/store";
import { jsonError, jsonOk } from "@/lib/keel/http";
import { por } from "@/lib/keel/engine";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await resolveSession(id);
  if (!session) return jsonError("Session not found", 404);
  return jsonOk({
    sessionId: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    config: session.state.config,
    por: por(session.state),
    accounts: session.state.accounts,
    disputes: session.state.disputes,
    events: session.state.events.slice(0, 40),
    exitPoolUsdc: session.state.exitPoolUsdc,
    paused: session.state.paused,
    // Role map is not public — ops UI uses known demo actors.
    mode: "demo-simulator",
    disclaimer:
      "Off-chain session simulator. Not custody. Spoofable until BIND_STRICT + Stellar auth.",
  });
}
