import { NextResponse } from "next/server";
import { jsonOk, readBody } from "@/lib/keel/http";
import { submitVaultTx } from "@/lib/keel/vault-tx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readBody(req);
  const signedXdr = String(body.signedXdr ?? body.xdr ?? "");
  if (!signedXdr || signedXdr.length < 32) {
    return NextResponse.json(
      { error: "missing_signed_xdr" },
      { status: 400 },
    );
  }
  try {
    const result = await submitVaultTx(signedXdr);
    return jsonOk({ mode: "testnet-rpc", ...result });
  } catch (e) {
    return NextResponse.json(
      {
        error: "submit_failed",
        message: e instanceof Error ? e.message : "failed",
      },
      { status: 502 },
    );
  }
}
