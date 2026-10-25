import {
  Account,
  Address,
  Asset,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";
import { loadTestnetAddresses } from "@/lib/keel/testnet";
import { toStroops } from "@/lib/keel/vault-tx";

const FAUCET_CAP = "100"; // TUSDC

export type FaucetResult =
  | { ok: true; hash: string; amount: string; explorerUrl: string }
  | { ok: false; error: "need_trustline" | "not_configured" | "failed"; message: string };

function cfgOrThrow() {
  const cfg = loadTestnetAddresses();
  if (!cfg || cfg.status !== "live" || !cfg.tusdcSac) {
    throw new Error("testnet not live");
  }
  return cfg;
}

async function ensureAccount(
  horizon: string,
  address: string,
): Promise<boolean> {
  const res = await fetch(`${horizon}/accounts/${address}`);
  if (res.ok) return true;
  const fund = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`,
  );
  return fund.ok;
}

/** Classic changeTrust XDR for Freighter (TUSDC). */
export async function prepareTrustlineXdr(address: string): Promise<{
  xdr: string;
  networkPassphrase: string;
}> {
  const cfg = cfgOrThrow();
  const horizon = cfg.horizonUrl || "https://horizon-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  await ensureAccount(horizon, address);
  const accRes = await fetch(`${horizon}/accounts/${address}`);
  if (!accRes.ok) throw new Error("account missing after friendbot");
  const accJson = (await accRes.json()) as { sequence: string };
  const [code, issuer] = cfg.asset.split(":");
  if (!code || !issuer) throw new Error("bad asset in testnet.addresses.json");
  const asset = new Asset(code, issuer);
  const account = new Account(address, accJson.sequence);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(180)
    .build();
  return { xdr: tx.toXDR(), networkPassphrase: passphrase };
}

/** Mint TUSDC via SAC using issuer secret (server-side). */
export async function mintTusdc(
  toAddress: string,
  amountStr: string,
): Promise<FaucetResult> {
  const secret = process.env.BIND_TUSDC_ISSUER_SECRET?.trim();
  if (!secret) {
    return {
      ok: false,
      error: "not_configured",
      message: "BIND_TUSDC_ISSUER_SECRET missing — run scripts/sync-testnet-env.sh",
    };
  }

  let amount = amountStr.trim() || "50";
  if (Number(amount) > Number(FAUCET_CAP)) amount = FAUCET_CAP;

  const cfg = cfgOrThrow();
  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const horizon = cfg.horizonUrl || "https://horizon-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const issuer = Keypair.fromSecret(secret);

  if (issuer.publicKey() !== cfg.admin) {
    return {
      ok: false,
      error: "failed",
      message: "issuer secret does not match testnet.addresses.json admin",
    };
  }

  await ensureAccount(horizon, toAddress);
  await ensureAccount(horizon, issuer.publicKey());

  const srv = new rpc.Server(rpcUrl, { allowHttp: false });
  const account = await srv.getAccount(issuer.publicKey());
  const sac = new Contract(cfg.tusdcSac);
  const stroops = toStroops(amount);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      sac.call(
        "mint",
        Address.fromString(toAddress).toScVal(),
        nativeToScVal(stroops, { type: "i128" }),
      ),
    )
    .setTimeout(180)
    .build();

  const sim = await srv.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    const err =
      "error" in sim ? JSON.stringify(sim.error) : "simulation failed";
    if (/trust|Trustline|auth/i.test(err)) {
      return {
        ok: false,
        error: "need_trustline",
        message: "Recipient needs a TUSDC trustline — prepare trustline first",
      };
    }
    return { ok: false, error: "failed", message: err };
  }

  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(issuer);
  const sent = await srv.sendTransaction(assembled);
  if (sent.status === "ERROR") {
    const msg = JSON.stringify(sent.errorResult ?? sent.status);
    if (/trust|Trustline/i.test(msg)) {
      return { ok: false, error: "need_trustline", message: msg };
    }
    return { ok: false, error: "failed", message: msg };
  }

  const hash = sent.hash;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const got = await srv.getTransaction(hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return {
        ok: true,
        hash,
        amount,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
      };
    }
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
      return {
        ok: false,
        error: "failed",
        message: "mint transaction failed on-chain",
      };
    }
  }
  return {
    ok: true,
    hash,
    amount,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
  };
}
