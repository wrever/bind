import { NextResponse } from "next/server";
import { jsonOk } from "@/lib/keel/http";
import { readChainPor } from "@/lib/keel/chain-por";

export const dynamic = "force-dynamic";

/** Live read-only PoR from the published testnet vault (RPC simulate). */
export async function GET() {
  const result = await readChainPor();
  if (!result.ok) {
    return NextResponse.json(
      {
        error: "chain_por_unavailable",
        message: result.error,
        vault: result.vault,
        rpcUrl: result.rpcUrl,
        explorer: result.explorer,
      },
      { status: 502 },
    );
  }
  return jsonOk({
    mode: "testnet-rpc",
    network: result.network,
    vault: result.vault,
    rpcUrl: result.rpcUrl,
    explorer: result.explorer,
    por: result.por,
    asOf: result.asOf,
  });
}
