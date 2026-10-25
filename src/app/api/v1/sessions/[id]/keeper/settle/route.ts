import { applyAction } from "@/lib/keel/store";
import { jsonError, jsonOk } from "@/lib/keel/http";
import { por } from "@/lib/keel/engine";

export const dynamic = "force-dynamic";

/** Permissionless keeper: settle all ready lots in the session. */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const session = await applyAction(id, "settle_all", {});
    return jsonOk({
      sessionId: session.id,
      action: "settle_all",
      por: por(session.state),
      events: session.state.events.slice(0, 10),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Keeper failed";
    const status = message === "Session not found" ? 404 : 400;
    return jsonError(message, status);
  }
}
