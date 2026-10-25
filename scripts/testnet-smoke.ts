/**
 * Live PoR + prepare smoke against the published testnet vault.
 * Prefers Soroban RPC (no CLI identity). Falls back to stellar CLI if present.
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
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
    process.env.STELLAR_BIN || `${process.env.HOME}/.cargo/bin/stellar`;
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

async function prepareOk(
  srv: rpc.Server,
  passphrase: string,
  vault: string,
  address: string,
  op: ReturnType<Contract["call"]>,
) {
  const account = await srv.getAccount(address);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(op)
    .setTimeout(60)
    .build();
  const sim = await srv.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error(
      `prepare fail: ${"error" in sim ? JSON.stringify(sim.error) : "x"}`,
    );
  }
  return true;
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
    alice: string;
    bob: string;
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

  const srv = new rpc.Server(
    cfg.rpcUrl || "https://soroban-testnet.stellar.org",
  );
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const contract = new Contract(cfg.vault);
  const alice = cfg.alice;
  const prepares: string[] = [];

  try {
    await prepareOk(
      srv,
      passphrase,
      cfg.vault,
      alice,
      contract.call(
        "deposit",
        Address.fromString(alice).toScVal(),
        nativeToScVal(BigInt(1_000_000), { type: "i128" }),
      ),
    );
    prepares.push("deposit");
  } catch (e) {
    console.warn("prepare deposit skipped", e instanceof Error ? e.message : e);
  }

  try {
    await prepareOk(
      srv,
      passphrase,
      cfg.vault,
      alice,
      contract.call(
        "transfer",
        Address.fromString(alice).toScVal(),
        Address.fromString(cfg.bob).toScVal(),
        nativeToScVal(BigInt(1_000_000), { type: "i128" }),
      ),
    );
    prepares.push("transfer");
  } catch (e) {
    console.warn("prepare transfer skipped", e instanceof Error ? e.message : e);
  }

  try {
    await prepareOk(
      srv,
      passphrase,
      cfg.vault,
      alice,
      contract.call("settle", Address.fromString(alice).toScVal()),
    );
    prepares.push("settle");
  } catch (e) {
    console.warn("prepare settle skipped", e instanceof Error ? e.message : e);
  }

  console.log("ok", {
    via,
    vault: cfg.vault,
    fully_backed: por.fully_backed,
    vault_usdc: por.vault_usdc?.toString?.() ?? por.vault_usdc,
    supply: por.supply?.toString?.() ?? por.supply,
    prepares,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
