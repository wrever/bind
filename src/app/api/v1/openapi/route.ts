import { jsonOk } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

/** Machine-readable API surface for partner integrators. */
export function GET() {
  return jsonOk({
    openapi: "3.0.3",
    info: {
      title: "Bind Demo API",
      version: "0.1.0",
      description:
        "Bind protocol/transfer cover demo API. Session actions = policy simulator. /api/v1/chain/* = live Stellar testnet vault (Freighter-signed). Not mainnet custody.",
    },
    paths: {
      "/api/v1/health": {
        get: {
          summary: "Health + persistence backend status",
        },
      },
      "/api/v1/network": {
        get: {
          summary: "Network addresses + Chainlink stance + COVER rail",
        },
      },
      "/api/v1/chain/por": {
        get: {
          summary: "Live vault por() via Soroban RPC simulate",
        },
      },
      "/api/v1/chain/account": {
        get: {
          summary: "Testnet account XLM + TUSDC balance for Freighter address",
        },
      },
      "/api/v1/chain/tx/prepare": {
        post: {
          summary:
            "Assemble vault deposit|transfer|settle|unwrap|dispute XDR for Freighter",
        },
      },
      "/api/v1/chain/tx/submit": {
        post: {
          summary: "Submit Freighter-signed vault XDR and poll status",
        },
      },
      "/api/v1/sessions": {
        post: {
          summary: "Create demo session (Retention Cover)",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    retentionProfile: {
                      type: "string",
                      enum: ["standard", "kyc_fast_lane"],
                      description:
                        "standard = Protected 12h (no KYC); kyc_fast_lane = ~1h with attestation",
                    },
                    kycAttested: { type: "boolean" },
                    demoMode: {
                      type: "boolean",
                      description: "Compressed clocks (45s / 15s)",
                    },
                    windowMs: {
                      type: "number",
                      description: "Optional override; default from profile",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/sessions/{id}": {
        get: { summary: "Get session state" },
      },
      "/api/v1/sessions/{id}/por": {
        get: {
          summary: "Signed proof of reserves for session",
          description:
            "HMAC-SHA256 over canonical payload. Verify with POST /api/v1/por/verify. Snapshots to Supabase when configured.",
        },
      },
      "/api/v1/sessions/{id}/claims": {
        get: {
          summary: "Claim / ops audit events for session",
        },
      },
      "/api/v1/por/verify": {
        post: {
          summary: "Verify a signed PoR payload",
        },
      },
      "/api/v1/sessions/{id}/actions": {
        post: {
          summary: "Apply action",
          description:
            "actions: faucet | deposit | transfer | settle | settle_all | unwrap | exit | dispute | freeze | resolve | pause | unpause | set_retention. set_retention: { profile, kycAttested?, demoMode? }. Ops actor: ops_pauser|ops_recoverer|ops_freezer|ops_admin.",
        },
      },
      "/api/v1/sessions/{id}/keeper/settle": {
        post: {
          summary: "Keeper settle_all ready lots",
        },
      },
    },
  });
}
