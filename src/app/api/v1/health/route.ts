import {
  ensureStoreReady,
  persistenceBackend,
  sessionCount,
} from "@/lib/keel/store";
import { supabaseEnabled } from "@/lib/keel/supabase";
import { jsonOk } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureStoreReady();
  return jsonOk({
    ok: true,
    service: "keel",
    mode: process.env.KEEL_NETWORK ?? "demo",
    vision: "bind-protocol-cover",
    product: "Bind",
    designation: "BD-001",
    status: "ACTIVE",
    persistence: {
      backend: persistenceBackend(),
      supabaseConfigured: supabaseEnabled(),
      sessionsLoaded: sessionCount(),
    },
    time: new Date().toISOString(),
  });
}
