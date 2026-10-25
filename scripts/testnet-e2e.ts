/**
 * Signed e2e on published testnet vault (needs .env.local secrets).
 * Path: mint → deposit → transfer → dispute → resolve → peg OK
 *        + transfer → wait window → settle → unwrap
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnvLocal();

const ROOT = process.cwd();
const ADDR = path.join(ROOT, "docs/testnet.addresses.json");

function toStroops(amount: string): bigint {
  const [w, f = ""] = amount.split(".");
  const frac = (f + "0000000").slice(0, 7);
  return BigInt(w) * BigInt(10_000_000) + BigInt(frac);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function sendOp(
  srv: rpc.Server,
  passphrase: string,
  source: Keypair,
  op: ReturnType<Contract["call"]>,
): Promise<{ hash: string; returnValue?: unknown }> {
  const account = await srv.getAccount(source.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(op)
    .setTimeout(180)
    .build();
  const sim = await srv.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error(
      `simulate fail: ${"error" in sim ? JSON.stringify(sim.error) : "x"}`,
    );
  }
  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(source);
  const sent = await srv.sendTransaction(assembled);
  if (sent.status === "ERROR") {
    throw new Error(`send ERROR ${JSON.stringify(sent.errorResult)}`);
  }
  for (let i = 0; i < 25; i++) {
    await sleep(1500);
    const got = await srv.getTransaction(sent.hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      let returnValue: unknown;
      try {
        if ("returnValue" in got && got.returnValue) {
          returnValue = scValToNative(got.returnValue);
          if (typeof returnValue === "bigint") returnValue = returnValue.toString();
        }
      } catch {
        /* ignore */
      }
      return { hash: sent.hash, returnValue };
    }
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`tx FAILED ${sent.hash}`);
    }
  }
  throw new Error(`tx PENDING timeout ${sent.hash}`);
}

async function main() {
  if (!existsSync(ADDR)) throw new Error("missing testnet.addresses.json");
  const cfg = JSON.parse(readFileSync(ADDR, "utf8")) as {
    vault: string;
    tusdcSac: string;
    alice: string;
    bob: string;
    admin: string;
    arbiter: string;
    windowSecs: number;
    rpcUrl: string;
    networkPassphrase: string;
    status: string;
  };
  if (cfg.status !== "live") throw new Error("vault not live");

  const issuerSecret = process.env.BIND_TUSDC_ISSUER_SECRET?.trim();
  const aliceSecret = process.env.BIND_ALICE_SECRET?.trim();
  const arbiterSecret = process.env.BIND_ARBITER_SECRET?.trim();
  if (!issuerSecret || !aliceSecret || !arbiterSecret) {
    throw new Error(
      "Need BIND_TUSDC_ISSUER_SECRET, BIND_ALICE_SECRET, BIND_ARBITER_SECRET — run bash scripts/sync-testnet-env.sh",
    );
  }

  const issuer = Keypair.fromSecret(issuerSecret);
  const alice = Keypair.fromSecret(aliceSecret);
  const arbiter = Keypair.fromSecret(arbiterSecret);
  if (issuer.publicKey() !== cfg.admin) throw new Error("issuer ≠ admin");
  if (alice.publicKey() !== cfg.alice) throw new Error("alice key mismatch");
  if (arbiter.publicKey() !== cfg.arbiter) throw new Error("arbiter mismatch");

  const srv = new rpc.Server(cfg.rpcUrl || "https://soroban-testnet.stellar.org");
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const vault = new Contract(cfg.vault);
  const sac = new Contract(cfg.tusdcSac);
  const hashes: string[] = [];

  console.log("==> mint 20 TUSDC to alice");
  let r = await sendOp(
    srv,
    passphrase,
    issuer,
    sac.call(
      "mint",
      Address.fromString(cfg.alice).toScVal(),
      nativeToScVal(toStroops("20"), { type: "i128" }),
    ),
  );
  hashes.push(r.hash);

  console.log("==> deposit 15");
  r = await sendOp(
    srv,
    passphrase,
    alice,
    vault.call(
      "deposit",
      Address.fromString(cfg.alice).toScVal(),
      nativeToScVal(toStroops("15"), { type: "i128" }),
    ),
  );
  hashes.push(r.hash);

  console.log("==> transfer 5 to bob (open lot)");
  r = await sendOp(
    srv,
    passphrase,
    alice,
    vault.call(
      "transfer",
      Address.fromString(cfg.alice).toScVal(),
      Address.fromString(cfg.bob).toScVal(),
      nativeToScVal(toStroops("5"), { type: "i128" }),
    ),
  );
  hashes.push(r.hash);
  const lotId = String(r.returnValue ?? "");
  if (!lotId) throw new Error("transfer did not return lot id");
  console.log("    lot", lotId);

  console.log("==> dispute lot");
  r = await sendOp(
    srv,
    passphrase,
    alice,
    vault.call(
      "dispute",
      Address.fromString(cfg.alice).toScVal(),
      nativeToScVal(BigInt(lotId), { type: "u64" }),
    ),
  );
  hashes.push(r.hash);

  console.log("==> resolve approve (arbiter)");
  r = await sendOp(
    srv,
    passphrase,
    arbiter,
    vault.call(
      "resolve",
      nativeToScVal(BigInt(lotId), { type: "u64" }),
      nativeToScVal(true, { type: "bool" }),
    ),
  );
  hashes.push(r.hash);

  console.log("==> transfer 3 + wait window + settle + unwrap");
  r = await sendOp(
    srv,
    passphrase,
    alice,
    vault.call(
      "transfer",
      Address.fromString(cfg.alice).toScVal(),
      Address.fromString(cfg.bob).toScVal(),
      nativeToScVal(toStroops("3"), { type: "i128" }),
    ),
  );
  hashes.push(r.hash);

  const waitMs = Math.max((cfg.windowSecs ?? 60) + 5, 10) * 1000;
  console.log(`    sleeping ${waitMs / 1000}s for retention window`);
  await sleep(waitMs);

  // bob needs key for settle — use alice settle won't settle bob's lots.
  // For settle we need bob secret. Generate path: settle as bob if we have key,
  // else skip settle path when BIND_BOB_SECRET missing.
  const bobSecret = process.env.BIND_BOB_SECRET?.trim();
  if (!bobSecret) {
    throw new Error("BIND_BOB_SECRET missing — run bash scripts/sync-testnet-env.sh");
  }
  const bob = Keypair.fromSecret(bobSecret);
  if (bob.publicKey() !== cfg.bob) throw new Error("bob key mismatch");
  r = await sendOp(
    srv,
    passphrase,
    bob,
    vault.call("settle", Address.fromString(cfg.bob).toScVal()),
  );
  hashes.push(r.hash);
  r = await sendOp(
    srv,
    passphrase,
    bob,
    vault.call(
      "unwrap",
      Address.fromString(cfg.bob).toScVal(),
      nativeToScVal(toStroops("3"), { type: "i128" }),
    ),
  );
  hashes.push(r.hash);

  console.log("==> por");
  const account = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0",
  );
  const porTx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: passphrase,
  })
    .addOperation(vault.call("por"))
    .setTimeout(30)
    .build();
  const sim = await srv.simulateTransaction(porTx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
    throw new Error("por simulate failed");
  }
  const por = scValToNative(sim.result.retval) as {
    fully_backed: boolean;
    vault_usdc: bigint | string;
    supply: bigint | string;
  };
  if (!por.fully_backed) throw new Error(`peg broken ${JSON.stringify(por)}`);

  console.log("ok", {
    vault: cfg.vault,
    fully_backed: por.fully_backed,
    hashes: hashes.map(
      (h) => `https://stellar.expert/explorer/testnet/tx/${h}`,
    ),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
