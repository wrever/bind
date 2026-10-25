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
  xdr,
} from "@stellar/stellar-sdk";
import { loadTestnetAddresses } from "@/lib/keel/testnet";

export type VaultAction =
  | { action: "deposit"; address: string; amount: string }
  | { action: "transfer"; address: string; to: string; amount: string }
  | { action: "settle"; address: string }
  | { action: "unwrap"; address: string; amount: string }
  | { action: "dispute"; address: string; lotId: string };

export type PreparedTx = {
  xdr: string;
  networkPassphrase: string;
  rpcUrl: string;
  vault: string;
  action: string;
  address: string;
};

export type SubmitResult = {
  hash: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "NOT_FOUND" | string;
  explorerUrl: string;
};

function cfgOrThrow() {
  const cfg = loadTestnetAddresses();
  if (!cfg || cfg.status !== "live" || !cfg.vault) {
    throw new Error("testnet vault not live — see docs/testnet.addresses.json");
  }
  return cfg;
}

function server(rpcUrl: string) {
  return new rpc.Server(rpcUrl, { allowHttp: false });
}

/** USDC-style 7-decimal → i128 stroops */
export function toStroops(amount: string): bigint {
  const t = amount.trim();
  if (!/^\d+(\.\d{1,7})?$/.test(t)) {
    throw new Error("amount must be a decimal with up to 7 places");
  }
  const [w, f = ""] = t.split(".");
  const frac = (f + "0000000").slice(0, 7);
  return BigInt(w) * BigInt(10_000_000) + BigInt(frac);
}

function opFor(
  contract: Contract,
  body: VaultAction,
): ReturnType<Contract["call"]> {
  const from = Address.fromString(body.address);
  switch (body.action) {
    case "deposit":
      return contract.call(
        "deposit",
        from.toScVal(),
        nativeToScVal(toStroops(body.amount), { type: "i128" }),
      );
    case "transfer":
      return contract.call(
        "transfer",
        from.toScVal(),
        Address.fromString(body.to).toScVal(),
        nativeToScVal(toStroops(body.amount), { type: "i128" }),
      );
    case "settle":
      return contract.call("settle", from.toScVal());
    case "unwrap":
      return contract.call(
        "unwrap",
        from.toScVal(),
        nativeToScVal(toStroops(body.amount), { type: "i128" }),
      );
    case "dispute":
      return contract.call(
        "dispute",
        from.toScVal(),
        nativeToScVal(BigInt(body.lotId), { type: "u64" }),
      );
    default:
      throw new Error("unknown action");
  }
}

/** Build + simulate + assemble a vault tx for Freighter to sign. */
export async function prepareVaultTx(body: VaultAction): Promise<PreparedTx> {
  const cfg = cfgOrThrow();
  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const srv = server(rpcUrl);

  const account = await srv.getAccount(body.address);
  const contract = new Contract(cfg.vault);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(opFor(contract, body))
    .setTimeout(180)
    .build();

  const sim = await srv.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim) || !rpc.Api.isSimulationSuccess(sim)) {
    const err =
      "error" in sim ? JSON.stringify(sim.error) : "simulation failed";
    throw new Error(`simulate: ${err}`);
  }

  const assembled = rpc.assembleTransaction(tx, sim).build();
  return {
    xdr: assembled.toXDR(),
    networkPassphrase: passphrase,
    rpcUrl,
    vault: cfg.vault,
    action: body.action,
    address: body.address,
  };
}

/** Submit a Freighter-signed XDR and poll until terminal. */
export async function submitVaultTx(signedXdr: string): Promise<SubmitResult> {
  const cfg = cfgOrThrow();
  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const srv = server(rpcUrl);

  const tx = TransactionBuilder.fromXDR(signedXdr, passphrase);
  const sent = await srv.sendTransaction(tx);
  if (sent.status === "ERROR") {
    throw new Error(
      `send ERROR: ${JSON.stringify(sent.errorResult ?? sent.status)}`,
    );
  }

  const hash = sent.hash;
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${hash}`;

  // Poll getTransaction up to ~30s
  for (let i = 0; i < 20; i++) {
    await sleep(1500);
    const got = await srv.getTransaction(hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return { hash, status: "SUCCESS", explorerUrl };
    }
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
      return { hash, status: "FAILED", explorerUrl };
    }
  }
  return { hash, status: "PENDING", explorerUrl };
}

export type AccountView = {
  address: string;
  exists: boolean;
  xlm?: string;
  tusdc?: string;
  vault: string;
  tusdcSac: string;
  explorer: { vault: string; account: string };
};

export async function readAccountView(address: string): Promise<AccountView> {
  const cfg = cfgOrThrow();
  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const horizon =
    cfg.horizonUrl || "https://horizon-testnet.stellar.org";
  const explorerAccount = `https://stellar.expert/explorer/testnet/account/${address}`;

  let exists = false;
  let xlm: string | undefined;
  try {
    const res = await fetch(`${horizon}/accounts/${address}`);
    if (res.ok) {
      exists = true;
      const json = (await res.json()) as {
        balances?: { asset_type: string; balance: string }[];
      };
      const native = json.balances?.find((b) => b.asset_type === "native");
      xlm = native?.balance;
    }
  } catch {
    /* ignore */
  }

  let tusdc: string | undefined;
  try {
    const srv = server(rpcUrl);
    // SAC balance via simulate balance(address)
    const account = new Account(address, "0");
    const sac = new Contract(cfg.tusdcSac);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: cfg.networkPassphrase || Networks.TESTNET,
    })
      .addOperation(
        sac.call("balance", Address.fromString(address).toScVal()),
      )
      .setTimeout(30)
      .build();
    const sim = await srv.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      const native = scValToBigInt(sim.result.retval);
      tusdc = fromStroops(native);
    }
  } catch {
    /* no trustline / not funded */
  }

  return {
    address,
    exists,
    xlm,
    tusdc,
    vault: cfg.vault,
    tusdcSac: cfg.tusdcSac,
    explorer: { vault: cfg.explorer.vault, account: explorerAccount },
  };
}

function scValToBigInt(v: xdr.ScVal): bigint {
  const n = scValToNative(v);
  if (typeof n === "bigint") return n;
  if (typeof n === "number") return BigInt(n);
  if (typeof n === "string") return BigInt(n);
  return BigInt(0);
}

function fromStroops(n: bigint): string {
  const scale = BigInt(10_000_000);
  const whole = n / scale;
  const frac = (n % scale).toString().padStart(7, "0").replace(/0+$/, "") || "0";
  return frac === "0" ? whole.toString() : `${whole}.${frac}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
