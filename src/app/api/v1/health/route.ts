import {
  ensureStoreReady,
  persistenceBackend,
  sessionCount,
} from "@/lib/keel/store";
import { supabaseEnabled } from "@/lib/keel/supabase";
import { loadTestnetAddresses } from "@/lib/keel/testnet";
import { jsonOk } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureStoreReady();
  const testnet = loadTestnetAddresses();
  const chainLive = testnet?.status === "live" && Boolean(testnet.vault);
  const mode =
    process.env.KEEL_NETWORK ?? (chainLive ? "testnet" : "demo");
  return jsonOk({
    ok: true,
    service: "bind",
    mode,
    vision: "bind-protocol-cover",
    product: "Bind",
    designation: "BD-001",
    status: "ACTIVE",
    tracks: {
      simulator: {
        surface: "/demo + /api/v1/sessions/*",
        custody: false,
        note: "Policy engine demo, not the on-chain vault",
      },
      chain: {
        surface: "/live + /api/v1/chain/*",
        live: chainLive,
        vault: testnet?.vault ?? null,
        deployedAt: testnet?.deployedAt ?? null,
      },
    },
    persistence: {
      backend: persistenceBackend(),
      supabaseConfigured: supabaseEnabled(),
      sessionsLoaded: sessionCount(),
      note: "Simulator sessions only, not vault balances",
    },
    time: new Date().toISOString(),
  });
}
