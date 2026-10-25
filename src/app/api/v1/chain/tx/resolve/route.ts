import { NextResponse } from "next/server";
import { jsonOk, readBody } from "@/lib/keel/http";
import { requireOpsToken } from "@/lib/keel/ops-auth";
import { resolveLotServer } from "@/lib/keel/vault-tx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = requireOpsToken(req);
  if (denied) return denied;

  const body = await readBody(req);
  const lotId = String(body.lotId ?? "");
  if (!/^\d+$/.test(lotId)) {
    return NextResponse.json({ error: "invalid_lot_id" }, { status: 400 });
  }
  const approve = body.approve !== false && body.approve !== "false";

  try {
    const result = await resolveLotServer({ lotId, approve });
    return jsonOk({
      mode: "testnet-rpc",
      action: "resolve",
      lotId,
      approve,
      ...result,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "resolve_failed",
        message: e instanceof Error ? e.message : "failed",
      },
      { status: 502 },
    );
  }
}