import {
  persistPorSnapshot,
  resolveSession,
  sessionPor,
} from "@/lib/keel/store";
import { signPor } from "@/lib/keel/por-sign";
import { jsonError, jsonOk } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

/**
 * Signed proof of reserves for a demo session.
 * HMAC-SHA256 over canonical payload (KEEL_POR_SECRET, default demo key).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!(await resolveSession(id))) return jsonError("Session not found", 404);
  const reserves = await sessionPor(id);
  void persistPorSnapshot(id, reserves);
  return jsonOk(signPor(reserves, id));
}
