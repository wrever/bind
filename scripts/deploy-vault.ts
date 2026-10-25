/**
 * Deploy keel-vault WASM to Soroban testnet (or print the exact commands).
 *
 * Usage:
 *   npx tsx scripts/deploy-vault.ts
 *   npx tsx scripts/deploy-vault.ts --execute
 */

import { existsSync, statSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd());
const WASM = path.join(
  ROOT,
  "contracts/keel-vault/target/wasm32v1-none/release/keel_vault.wasm",
);
const execute = process.argv.includes("--execute");
const NETWORK = process.env.STELLAR_NETWORK ?? "testnet";
const SOURCE = process.env.STELLAR_SOURCE ?? "keel-deploy";

const INIT = {
  windowSecs: Number(process.env.KEEL_WINDOW_SECS ?? 86_400),
  exitFeeBps: Number(process.env.KEEL_EXIT_FEE_BPS ?? 30),
  maxSupply: process.env.KEEL_MAX_SUPPLY ?? "0",
  exitPoolSeed: process.env.KEEL_EXIT_POOL_SEED ?? "0",
  usdc: process.env.KEEL_USDC_CONTRACT ?? "<USDC_SAC_OR_ASSET_CONTRACT>",
  admin: process.env.KEEL_ADMIN ?? "<ADMIN_ADDRESS>",
  arbiter: process.env.KEEL_ARBITER ?? "<ARBITER_ADDRESS>",
};

function main() {
  console.log("Keel vault deploy");
  const built = existsSync(WASM);
  console.log({
    network: NETWORK,
    source: SOURCE,
    wasm: WASM,
    built,
    size: built ? statSync(WASM).size : null,
    init: INIT,
  });

  if (!built) {
    console.log("\nBuild first: npm run build:vault");
  }

  console.log(`
stellar-cli sketch:

  stellar contract upload \\
    --wasm ${WASM} \\
    --source ${SOURCE} \\
    --network ${NETWORK}

  stellar contract deploy \\
    --wasm-hash <HASH> \\
    --source ${SOURCE} \\
    --network ${NETWORK}

  stellar contract invoke \\
    --id <CONTRACT_ID> \\
    --source ${SOURCE} \\
    --network ${NETWORK} \\
    -- initialize \\
    --admin ${INIT.admin} \\
    --arbiter ${INIT.arbiter} \\
    --usdc ${INIT.usdc} \\
    --window_secs ${INIT.windowSecs} \\
    --exit_fee_bps ${INIT.exitFeeBps} \\
    --max_supply ${INIT.maxSupply} \\
    --exit_pool_seed ${INIT.exitPoolSeed}

After success: paste addresses into docs/TESTNET.md
`);

  if (!execute) {
    console.log("Dry-run only. Pass --execute once stellar CLI + keys are configured.");
    return;
  }

  console.error(
    "Execute path expects `stellar` on PATH. Install CLI, fund account, re-run with env vars set.",
  );
  process.exit(2);
}

main();
