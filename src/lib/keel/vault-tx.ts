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
  xdr,
} from "@stellar/stellar-sdk";
import { loadTestnetAddresses } from "@/lib/keel/testnet";

export type VaultAction =
  | { action: "deposit"; address: string; amount: string }
  | { action: "transfer"; address: string; to: string; amount: string }
  | { action: "settle"; address: string }
  | { action: "unwrap"; address: string; amount: string }
  | { action: "exit"; address: string; amount: string }
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
  returnValue?: unknown;
};

export type LotView = {
  id: string;
  amount: string;
  receivedAt: string;
  frozen: boolean;
  from: string;
};

export type AccountView = {
  address: string;
  exists: boolean;
  xlm?: string;
  tusdc?: string;
  settled?: string;
  unsettled?: string;
  lots?: LotView[];
  vault: string;
  tusdcSac: string;
  windowSecs?: number;
  explorer: { vault: string; account: string };
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

export function fromStroops(n: bigint): string {
  const scale = BigInt(10_000_000);
  const whole = n / scale;
  const frac =
    (n % scale).toString().padStart(7, "0").replace(/0+$/, "") || "0";
  return frac === "0" ? whole.toString() : `${whole}.${frac}`;
}

function scValToBigInt(v: xdr.ScVal): bigint {
  const n = scValToNative(v);
  if (typeof n === "bigint") return n;
  if (typeof n === "number") return BigInt(n);
  if (typeof n === "string") return BigInt(n);
  return BigInt(0);
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
    case "exit":
      return contract.call(
        "exit",
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

function parseReturnValue(raw: unknown): unknown {
  if (raw == null) return undefined;
  try {
    const n = scValToNative(raw as xdr.ScVal);
    if (typeof n === "bigint") return n.toString();
    return n;
  } catch {
    return undefined;
  }
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

  for (let i = 0; i < 20; i++) {
    await sleep(1500);
    const got = await srv.getTransaction(hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      const returnValue = parseReturnValue(
        "returnValue" in got ? got.returnValue : undefined,
      );
      return { hash, status: "SUCCESS", explorerUrl, returnValue };
    }
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
      return { hash, status: "FAILED", explorerUrl };
    }
  }
  return { hash, status: "PENDING", explorerUrl };
}

/** Arbiter-signed resolve (server-side claims ops). */
export async function resolveLotServer(opts: {
  lotId: string;
  approve: boolean;
}): Promise<SubmitResult> {
  const secret = process.env.BIND_ARBITER_SECRET?.trim();
  if (!secret) {
    throw new Error("BIND_ARBITER_SECRET missing — run scripts/sync-testnet-env.sh");
  }
  const cfg = cfgOrThrow();
  const arbiter = Keypair.fromSecret(secret);
  if (arbiter.publicKey() !== cfg.arbiter) {
    throw new Error("arbiter secret does not match testnet.addresses.json");
  }

  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const srv = server(rpcUrl);
  const account = await srv.getAccount(arbiter.publicKey());
  const contract = new Contract(cfg.vault);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "resolve",
        nativeToScVal(BigInt(opts.lotId), { type: "u64" }),
        nativeToScVal(opts.approve, { type: "bool" }),
      ),
    )
    .setTimeout(180)
    .build();

  const sim = await srv.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    const err =
      "error" in sim ? JSON.stringify(sim.error) : "simulation failed";
    throw new Error(`simulate resolve: ${err}`);
  }
  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(arbiter);
  return submitVaultTx(assembled.toXDR());
}

async function simulateView(
  srv: rpc.Server,
  passphrase: string,
  contractId: string,
  fn: string,
  ...args: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  const account = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0",
  );
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call(fn, ...args))
    .setTimeout(30)
    .build();
  const sim = await srv.simulateTransaction(tx);
  if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
    return sim.result.retval;
  }
  return null;
}

export async function readAccountView(address: string): Promise<AccountView> {
  const cfg = cfgOrThrow();
  const rpcUrl = cfg.rpcUrl || "https://soroban-testnet.stellar.org";
  const horizon = cfg.horizonUrl || "https://horizon-testnet.stellar.org";
  const passphrase = cfg.networkPassphrase || Networks.TESTNET;
  const explorerAccount = `https://stellar.expert/explorer/testnet/account/${address}`;
  const srv = server(rpcUrl);

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
    const retval = await simulateView(
      srv,
      passphrase,
      cfg.tusdcSac,
      "balance",
      Address.fromString(address).toScVal(),
    );
    if (retval) tusdc = fromStroops(scValToBigInt(retval));
  } catch {
    /* no trustline */
  }

  let settled: string | undefined;
  let unsettled: string | undefined;
  let lots: LotView[] | undefined;
  try {
    const who = Address.fromString(address).toScVal();
    const creditsRet = await simulateView(
      srv,
      passphrase,
      cfg.vault,
      "credits",
      who,
    );
    if (creditsRet) {
      const c = scValToNative(creditsRet) as {
        settled?: bigint | number | string;
        unsettled?: bigint | number | string;
      };
      settled = fromStroops(BigInt(c.settled ?? 0));
      unsettled = fromStroops(BigInt(c.unsettled ?? 0));
    }
    const lotsRet = await simulateView(
      srv,
      passphrase,
      cfg.vault,
      "lots_of",
      who,
    );
    if (lotsRet) {
      const raw = scValToNative(lotsRet) as Array<{
        id: bigint | number | string;
        amount: bigint | number | string;
        received_at: bigint | number | string;
        frozen: boolean;
        from: string;
      }>;
      lots = (raw ?? []).map((l) => ({
        id: String(l.id),
        amount: fromStroops(BigInt(l.amount)),
        receivedAt: String(l.received_at),
        frozen: Boolean(l.frozen),
        from: String(l.from),
      }));
    }
  } catch {
    /* old vault without views */
  }

  return {
    address,
    exists,
    xlm,
    tusdc,
    settled,
    unsettled,
    lots,
    vault: cfg.vault,
    tusdcSac: cfg.tusdcSac,
    windowSecs: cfg.windowSecs,
    explorer: { vault: cfg.explorer.vault, account: explorerAccount },
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
