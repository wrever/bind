import { readFileSync, existsSync } from "fs";
import path from "path";

export type TestnetAddresses = {
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  deployedAt: string;
  windowSecs: number;
  exitFeeBps: number;
  assetCode: string;
  asset: string;
  tusdcSac: string;
  circleUsdcSac: string;
  circleUsdcIssuer: string;
  vault: string;
  admin: string;
  arbiter: string;
  alice: string;
  bob: string;
  explorer: { vault: string; tusdc: string; deployTx?: string };
  status: string;
  smoke?: Record<string, unknown>;
  notes?: string;
};

export function loadTestnetAddresses(): TestnetAddresses | null {
  const file = path.join(process.cwd(), "docs/testnet.addresses.json");
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as TestnetAddresses;
  } catch {
    return null;
  }
}
