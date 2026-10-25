import { NextResponse } from "next/server";
import { jsonOk, readBody } from "@/lib/keel/http";
import { requireOpsToken } from "@/lib/keel/ops-auth";
import { mintTusdc, prepareTrustlineXdr } from "@/lib/keel/tusdc-faucet";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = requireOpsToken(req);
  if (denied) return denied;

  const body = await readBody(req);
  const address = String(body.address ?? "");
  if (!/^G[A-Z0-9]{55}$/.test(address)) {
    return NextResponse.json({ error: "invalid_address" }, { status: 400 });
  }

  if (body.trustlineOnly) {
    try {
      const prep = await prepareTrustlineXdr(address);
      return jsonOk({ action: "trustline", ...prep });
    } catch (e) {
      return NextResponse.json(
        {
          error: "trustline_prepare_failed",
          message: e instanceof Error ? e.message : "failed",
        },
        { status: 502 },
      );
    }
  }

  const amount = String(body.amount ?? "50");
  const result = await mintTusdc(address, amount);
  if (!result.ok) {
    const status =
      result.error === "need_trustline"
        ? 409
        : result.error === "not_configured"
          ? 503
          : 502;
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status },
    );
  }
  return jsonOk({
    mode: "testnet-rpc",
    action: "faucet",
    address,
    amount: result.amount,
    hash: result.hash,
    explorerUrl: result.explorerUrl,
  });
}
