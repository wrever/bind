export {}; // module boundary for tsc

/**
 * Checklist / dry-run for a Stellar Classic issuer with clawback.
 * Does not submit txs unless STELLAR_SECRET + STELLAR_HORIZON are set
 * and --execute is passed (requires @stellar/stellar-sdk — optional).
 *
 * Usage:
 *   npx tsx scripts/issuer-clawback.ts
 *   npx tsx scripts/issuer-clawback.ts --execute
 */

const NETWORK = process.env.STELLAR_NETWORK ?? "testnet";
const ASSET_CODE = process.env.KEEL_ASSET_CODE ?? "rUSDC";
const execute = process.argv.includes("--execute");

const FLAGS = [
  { name: "AUTH_REQUIRED_FLAG", why: "trustlines need issuer auth before hold" },
  { name: "AUTH_REVOCABLE_FLAG", why: "required companion for clawback" },
  { name: "AUTH_CLAWBACK_ENABLED_FLAG", why: "issuer can clawback from holders" },
];

function main() {
  console.log("Keel issuer clawback runbook");
  console.log({ network: NETWORK, assetCode: ASSET_CODE, execute });
  console.log("\nRequired account flags:");
  for (const f of FLAGS) {
    console.log(`  - ${f.name}: ${f.why}`);
  }
  console.log(`
Classic ops (stellar-cli sketch):
  stellar tx new set-options \\
    --set-flags auth-required,auth-revocable,auth-clawback-enabled \\
    --source-account <ISSUER> --network ${NETWORK}

  # Trustline + mint for vault/user (after vault deploy):
  stellar tx new change-trust --line ${ASSET_CODE}:<ISSUER> ...
  stellar tx new payment --asset ${ASSET_CODE}:<ISSUER> --amount ...

Clawback of unsettled rUSDC (prod path):
  stellar tx new clawback --from <HOLDER> --asset ${ASSET_CODE}:<ISSUER> --amount ...
  # then remint settled to claimant via vault/ops — never send to opaque hot wallet
`);

  if (!execute) {
    console.log("Dry-run only. Pass --execute with STELLAR_SECRET when ready to submit.");
    return;
  }

  const secret = process.env.STELLAR_SECRET;
  if (!secret) {
    console.error("STELLAR_SECRET required for --execute");
    process.exit(1);
  }

  console.error(
    "Execute path: install @stellar/stellar-sdk and wire Horizon submit, or use stellar-cli as above.",
  );
  console.error("Refusing to invent a half-wired submitter in this slice.");
  process.exit(2);
}

main();
