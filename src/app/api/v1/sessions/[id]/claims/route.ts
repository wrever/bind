import { listClaimEvents, resolveSession } from "@/lib/keel/store";
import { jsonError, jsonOk } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

/** Audit trail for transfer-insurance claims / ops actions. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!(await resolveSession(id))) return jsonError("Session not found", 404);
  const events = await listClaimEvents(id, 50);
  return jsonOk({
    sessionId: id,
    count: events.length,
    events,
  });
}
