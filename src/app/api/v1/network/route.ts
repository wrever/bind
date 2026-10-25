import { jsonOk } from "@/lib/keel/http";
import { loadTestnetAddresses } from "@/lib/keel/testnet";

export const dynamic = "force-dynamic";

/** Published network addresses + oracle stance for integrators. */
export function GET() {
  const testnet = loadTestnetAddresses();
  return jsonOk({
    mode: process.env.KEEL_NETWORK ?? (testnet?.status === "live" ? "testnet" : "demo"),
    chainlink: {
      useful: false,
      reason:
        "Price feeds do not secure the 1:1 USDC peg or recover path. Optional later for DeFi pricing / external PoR attestation.",
      docs: "docs/CHAINLINK.md",
      dataFeedsProxy: {
        testnet: "CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4",
        mainnet: "CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ",
      },
    },
    testnet: testnet
      ? {
          status: testnet.status,
          vault: testnet.vault,
          tusdcSac: testnet.tusdcSac,
          admin: testnet.admin,
          arbiter: testnet.arbiter,
          windowSecs: testnet.windowSecs,
          exitFeeBps: testnet.exitFeeBps,
          rpcUrl: testnet.rpcUrl,
          explorer: testnet.explorer,
          smoke: testnet.smoke,
          deployedAt: testnet.deployedAt,
          runbook: "docs/TESTNET.md",
          circleUsdcSac: testnet.circleUsdcSac,
        }
      : {
          status: "missing_addresses_file",
          runbook: "docs/TESTNET.md",
        },
    roles: {
      admin: "ops_admin",
      pauser: "ops_pauser",
      recoverer: "ops_recoverer",
      freezer: "ops_freezer",
    },
    hackathon: (testnet as { hackathon?: unknown } | null)?.hackathon ?? {
      category: "Genesis",
      track: "Stellar Unlocked",
      product: "transfer-insurance",
    },
    cover: (testnet as { cover?: unknown } | null)?.cover ?? null,
    essential: {
      onChainVault: Boolean(testnet?.vault),
      pegSmoke: testnet?.smoke?.porFullyBacked === true,
      disputeRecover: testnet?.smoke?.disputeResolve === true,
      exitPool: testnet?.smoke?.exit === true,
      clawbackClaimsRail: Boolean(
        (testnet as { cover?: { smoke?: { clawbackClaim?: boolean } } } | null)
          ?.cover?.smoke?.clawbackClaim,
      ),
      next: [
        "Optional: swap TUSDC → Circle USDC SAC when faucet-funded",
        "Optional: Freighter connect + public keeper",
      ],
    },
  });
}
