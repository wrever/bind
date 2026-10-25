import { NextResponse } from "next/server";
import { jsonOk, readBody } from "@/lib/keel/http";
import {
  prepareVaultTx,
  type VaultAction,
} from "@/lib/keel/vault-tx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readBody(req);
  const action = String(body.action ?? "");
  const address = String(body.address ?? "");
  if (!/^G[A-Z0-9]{55}$/.test(address)) {
    return NextResponse.json(
      { error: "invalid_address" },
      { status: 400 },
    );
  }

  try {
    let payload: VaultAction;
    switch (action) {
      case "deposit":
      case "unwrap":
      case "exit":
        payload = {
          action,
          address,
          amount: String(body.amount ?? ""),
        };
        break;
      case "transfer":
        payload = {
          action: "transfer",
          address,
          to: String(body.to ?? ""),
          amount: String(body.amount ?? ""),
        };
        if (!/^G[A-Z0-9]{55}$/.test(payload.to)) {
          return NextResponse.json({ error: "invalid_to" }, { status: 400 });
        }
        break;
      case "settle":
        payload = { action: "settle", address };
        break;
      case "dispute":
        payload = {
          action: "dispute",
          address,
          lotId: String(body.lotId ?? ""),
        };
        break;
      default:
        return NextResponse.json(
          {
            error: "invalid_action",
            message:
              "deposit | transfer | settle | unwrap | exit | dispute",
          },
          { status: 400 },
        );
    }

    const prepared = await prepareVaultTx(payload);
    return jsonOk({
      mode: "testnet-rpc",
      ...prepared,
      note: "Sign xdr with Freighter, then POST /api/v1/chain/tx/submit",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "prepare_failed",
        message: e instanceof Error ? e.message : "failed",
      },
      { status: 502 },
    );
  }
}
