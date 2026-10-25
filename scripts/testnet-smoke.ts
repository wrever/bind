/**
 * Live PoR check against the published testnet vault.
 * Prefers Soroban RPC (no CLI identity). Falls back to stellar CLI if present.
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import {
  Account,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";

const ROOT = process.cwd();
const ADDR = path.join(ROOT, "docs/testnet.addresses.json");

async function porViaRpc(cfg: {
  vault: string;
  rpcUrl: string;
  networkPassphrase: string;
}) {
  const server = new rpc.Server(cfg.rpcUrl, { allowHttp: false });
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
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
    throw new Error("RPC simulate por() failed");
  }
  return scValToNative(sim.result.retval) as {
    fully_backed: boolean;
    supply: string | number | bigint;
    vault_usdc: string | number | bigint;
  };
}

function porViaCli(vault: string) {
  const stellar =
    process.env.STELLAR_BIN ||
    `${process.env.HOME}/.cargo/bin/stellar`;
  const out = execFileSync(
    stellar,
    [
      "contract",
      "invoke",
      "--id",
      vault,
      "--source",
      process.env.STELLAR_SOURCE || "keel-admin",
      "--network",
      "testnet",
      "--",
      "por",
    ],
    { encoding: "utf8" },
  ).trim();
  const jsonLine = out
    .split("\n")
    .map((l) => l.trim())
    .reverse()
    .find((l) => l.startsWith("{"));
  if (!jsonLine) throw new Error(`no por json in CLI output:\n${out}`);
  return JSON.parse(jsonLine) as { fully_backed: boolean };
}

async function main() {
  if (!existsSync(ADDR)) {
    throw new Error("docs/testnet.addresses.json missing — run npm run testnet:up");
  }
  const cfg = JSON.parse(readFileSync(ADDR, "utf8")) as {
    vault: string;
    status: string;
    rpcUrl: string;
    networkPassphrase: string;
  };
  if (cfg.status !== "live") {
    throw new Error(`testnet status is ${cfg.status}, expected live`);
  }

  let por: { fully_backed: boolean; supply?: unknown; vault_usdc?: unknown };
  let via = "rpc";
  try {
    por = await porViaRpc({
      vault: cfg.vault,
      rpcUrl: cfg.rpcUrl || "https://soroban-testnet.stellar.org",
      networkPassphrase: cfg.networkPassphrase,
    });
  } catch (rpcErr) {
    via = "cli";
    console.warn("RPC por failed, trying CLI…", rpcErr);
    por = porViaCli(cfg.vault);
  }

  if (!por.fully_backed) {
    throw new Error(`peg broken: ${JSON.stringify(por)}`);
  }
  console.log("ok", {
    via,
    vault: cfg.vault,
    fully_backed: por.fully_backed,
    vault_usdc: por.vault_usdc?.toString?.() ?? por.vault_usdc,
    supply: por.supply?.toString?.() ?? por.supply,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
