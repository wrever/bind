import {
  Account,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { loadTestnetAddresses } from "@/lib/keel/testnet";

export type ChainPor = {
  vaultUsdc: string;
  supply: string;
  settled: string;
  unsettled: string;
  exitPool: string;
  feesEarned: string;
  paused: boolean;
  fullyBacked: boolean;
};

export type ChainPorResult =
  | {
      ok: true;
      network: string;
      vault: string;
      rpcUrl: string;
      explorer: { vault: string; deployTx?: string };
      por: ChainPor;
      asOf: string;
    }
  | {
      ok: false;
      error: string;
      vault?: string;
      rpcUrl?: string;
      explorer?: { vault: string; deployTx?: string };
    };

/** Read-only simulate of vault.por() on published testnet addresses. */
export async function readChainPor(): Promise<ChainPorResult> {
  const cfg = loadTestnetAddresses();
  if (!cfg || cfg.status !== "live" || !cfg.vault) {
    return { ok: false, error: "testnet vault addresses not live" };
  }

  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const explorer = cfg.explorer;

  try {
    const server = new rpc.Server(rpcUrl, { allowHttp: false });
    // Dummy account — simulation does not submit
    const account = new Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0",
    );
    const contract = new Contract(cfg.vault);
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: cfg.networkPassphrase || Networks.TESTNET,
    })
      .addOperation(contract.call("por"))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) {
      const detail =
        "error" in sim ? JSON.stringify(sim.error) : "simulation failed";
      return {
        ok: false,
        error: detail,
        vault: cfg.vault,
        rpcUrl,
        explorer,
      };
    }

    const retval = sim.result?.retval;
    if (!retval) {
      return {
        ok: false,
        error: "por() returned empty",
        vault: cfg.vault,
        rpcUrl,
        explorer,
      };
    }

    const native = scValToNative(retval) as Record<string, unknown>;
    const por: ChainPor = {
      vaultUsdc: stringifyI128(native.vault_usdc),
      supply: stringifyI128(native.supply),
      settled: stringifyI128(native.settled),
      unsettled: stringifyI128(native.unsettled),
      exitPool: stringifyI128(native.exit_pool),
      feesEarned: stringifyI128(native.fees_earned),
      paused: Boolean(native.paused),
      fullyBacked: Boolean(native.fully_backed),
    };

    return {
      ok: true,
      network: cfg.network,
      vault: cfg.vault,
      rpcUrl,
      explorer,
      por,
      asOf: new Date().toISOString(),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "chain por failed",
      vault: cfg.vault,
      rpcUrl,
      explorer,
    };
  }
}

function stringifyI128(v: unknown): string {
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "toString" in v) {
    return String((v as { toString: () => string }).toString());
  }
  return "0";
}
