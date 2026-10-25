import { NextResponse } from "next/server";
import { jsonOk } from "@/lib/keel/http";
import { readAccountView } from "@/lib/keel/vault-tx";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address")?.trim();
  if (!address || !/^G[A-Z0-9]{55}$/.test(address)) {
    return NextResponse.json(
      { error: "invalid_address", message: "pass ?address=G…" },
      { status: 400 },
    );
  }
  try {
    const view = await readAccountView(address);
    return jsonOk(view);
  } catch (e) {
    return NextResponse.json(
      {
        error: "account_unavailable",
        message: e instanceof Error ? e.message : "failed",
      },
      { status: 502 },
    );
  }
}
