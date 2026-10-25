/**
 * Smoke: create session via API → expect Supabase rows when .env.local set.
 * Usage: npm run dev (other terminal) then: npx tsx scripts/smoke-persist.ts
 */
const BASE = process.env.KEEL_BASE ?? "http://127.0.0.1:3847";

async function main() {
  const health = await fetch(`${BASE}/api/v1/health`).then((r) => r.json());
  console.log("health", {
    ok: health.ok,
    persistence: health.persistence,
  });
  if (!health.ok) throw new Error("health failed");

  const created = await fetch(`${BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ windowMs: 30_000 }),
  }).then((r) => r.json());
  if (!created.sessionId) throw new Error(JSON.stringify(created));
  const id = created.sessionId as string;

  await fetch(`${BASE}/api/v1/sessions/${id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "deposit", address: "alice", amount: 50 }),
  }).then((r) => r.json());

  const por = await fetch(`${BASE}/api/v1/sessions/${id}/por`).then((r) =>
    r.json(),
  );
  const claims = await fetch(`${BASE}/api/v1/sessions/${id}/claims`).then((r) =>
    r.json(),
  );

  console.log("session", id);
  console.log("por.fullyBacked", por.fullyBacked, "sig", Boolean(por.signature?.sig));
  console.log("claims.count", claims.count);
  console.log(
    "expect supabase rows if persistence.supabaseConfigured === true",
  );
  console.log("ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
