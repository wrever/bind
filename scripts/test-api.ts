export {}; // module boundary for tsc

const BASE = process.env.KEEL_BASE ?? "http://127.0.0.1:3847";

async function main() {
  const health = await fetch(`${BASE}/api/v1/health`).then((r) => r.json());
  if (!health.ok) throw new Error("health failed");

  const created = await fetch(`${BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ windowMs: 20 }),
  }).then((r) => r.json());
  if (!created.sessionId) throw new Error("session create failed");
  const id = created.sessionId as string;

  await act(id, { action: "deposit", address: "alice", amount: 100 });
  await act(id, {
    action: "transfer",
    from: "alice",
    to: "bob",
    amount: 25,
  });

  // wait window then keeper
  await new Promise((r) => setTimeout(r, 25));
  const keep = await fetch(`${BASE}/api/v1/sessions/${id}/keeper/settle`, {
    method: "POST",
  }).then((r) => r.json());
  if (keep.error) throw new Error(keep.error);

  const por = await fetch(`${BASE}/api/v1/sessions/${id}/por`).then((r) =>
    r.json(),
  );
  if (!por.fullyBacked) throw new Error("peg broken via API");
  if (typeof por.protocolFeesEarned !== "number") {
    throw new Error("por missing protocolFeesEarned");
  }
  if (!por.signature?.sig) throw new Error("por missing signature");

  const verified = await fetch(`${BASE}/api/v1/por/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ signature: por.signature }),
  }).then((r) => r.json());
  if (!verified.valid) throw new Error("por verify failed");

  const denied = await fetch(`${BASE}/api/v1/sessions/${id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "pause", actor: "eve" }),
  });
  if (denied.status !== 403) throw new Error("pause by eve should be 403");

  await act(id, { action: "pause", actor: "ops_pauser" });
  const blocked = await fetch(`${BASE}/api/v1/sessions/${id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "deposit",
      address: "alice",
      amount: 1,
    }),
  }).then((r) => r.json());
  if (!blocked.error) throw new Error("pause should block deposit");
  await act(id, { action: "unpause", actor: "ops_admin" });

  const oa = await fetch(`${BASE}/api/v1/openapi`).then((r) => r.json());
  if (oa.openapi !== "3.0.3") throw new Error("openapi missing");
  if (!oa.paths["/api/v1/por/verify"]) throw new Error("openapi missing verify");

  const net = await fetch(`${BASE}/api/v1/network`).then((r) => r.json());
  if (net.chainlink?.useful !== false) {
    throw new Error("network should mark Chainlink non-core");
  }
  if (net.testnet?.status === "live" && !net.testnet?.vault) {
    throw new Error("live testnet missing vault address");
  }
  if (net.essential && net.testnet?.status === "live" && !net.essential.onChainVault) {
    throw new Error("essential.onChainVault should be true when live");
  }

  // persistence: re-fetch session
  const again = await fetch(`${BASE}/api/v1/sessions/${id}`).then((r) =>
    r.json(),
  );
  if (again.sessionId !== id) throw new Error("session lost");

  console.log("ok", { sessionId: id, vaultUsdc: por.vaultUsdc });
}

async function act(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/v1/sessions/${id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
  if (res.error) throw new Error(res.error);
  return res;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
