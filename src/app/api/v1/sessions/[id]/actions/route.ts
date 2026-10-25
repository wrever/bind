import { applyAction, type ActionName } from "@/lib/keel/store";
import { jsonError, jsonOk, readBody } from "@/lib/keel/http";
import { por } from "@/lib/keel/engine";

export const dynamic = "force-dynamic";

const ACTIONS = new Set<ActionName>([
  "faucet",
  "deposit",
  "transfer",
  "settle",
  "settle_all",
  "unwrap",
  "exit",
  "dispute",
  "freeze",
  "resolve",
  "pause",
  "unpause",
  "set_retention",
]);

/**
 * Apply a Keel action to a demo session.
 * Body: { action, ...params }
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await readBody(req);
  const action = String(body.action ?? "") as ActionName;
  if (!ACTIONS.has(action)) {
    return jsonError(
      `Invalid action. Use one of: ${[...ACTIONS].join(", ")}`,
    );
  }
  try {
    const session = await applyAction(id, action, body);
    return jsonOk({
      sessionId: session.id,
      action,
      por: por(session.state),
      accounts: session.state.accounts,
      disputes: session.state.disputes,
      events: session.state.events.slice(0, 20),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Action failed";
    let status = 400;
    if (message === "Session not found") status = 404;
    else if (message.startsWith("Unauthorized")) status = 403;
    else if (message.startsWith("Rate limit")) status = 429;
    return jsonError(message, status);
  }
}
