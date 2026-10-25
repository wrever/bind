"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PersistenceStatus } from "@/components/persistence-status";
import type { Dispute, KeelState, ProofOfReserves } from "@/lib/keel/types";

type ClaimEvent = {
  id: string;
  action: string;
  actor?: string | null;
  lot_id?: string | null;
  created_at?: string;
};

type SessionView = {
  sessionId: string;
  por?: ProofOfReserves & {
    signature?: { sig: string; alg: string; keyId: string };
  };
  accounts?: KeelState["accounts"];
  disputes?: Dispute[];
  events?: unknown[];
  roles?: KeelState["roles"];
  paused?: boolean;
  claims?: ClaimEvent[];
};

const ACTORS = [
  "ops_pauser",
  "ops_recoverer",
  "ops_freezer",
  "ops_admin",
] as const;

export function OpsConsole() {
  const [sessionId, setSessionId] = useState("");
  const [actor, setActor] = useState<(typeof ACTORS)[number]>("ops_recoverer");
  const [view, setView] = useState<SessionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [freezeHolder, setFreezeHolder] = useState("bob");
  const [freezeLotId, setFreezeLotId] = useState("");

  const refresh = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/sessions/${id}`).then((r) => r.json());
    if (res.error) throw new Error(res.error);
    const [por, claimsRes] = await Promise.all([
      fetch(`/api/v1/sessions/${id}/por`).then((r) => r.json()),
      fetch(`/api/v1/sessions/${id}/claims`).then((r) => r.json()),
    ]);
    setView({
      sessionId: id,
      por,
      accounts: res.accounts,
      disputes: res.disputes ?? [],
      events: res.events ?? [],
      roles: res.roles,
      paused: res.paused ?? por.paused,
      claims: claimsRes.events ?? [],
    });
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const t = setInterval(() => {
      refresh(sessionId).catch(() => undefined);
    }, 2000);
    return () => clearInterval(t);
  }, [sessionId, refresh]);

  async function createSession() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ windowMs: 45_000 }),
      }).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setSessionId(res.sessionId);
      await seedDemo(res.sessionId);
      await refresh(res.sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  async function seedDemo(id: string) {
    await act(id, { action: "deposit", address: "alice", amount: 200 });
    await act(id, {
      action: "transfer",
      from: "alice",
      to: "bob",
      amount: 50,
    });
  }

  async function act(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/v1/sessions/${id}/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, ...(await r.json()) }));
    if (res.error) throw new Error(`${res.status}: ${res.error}`);
    return res;
  }

  async function run(body: Record<string, unknown>) {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await act(sessionId, { ...body, actor });
      await refresh(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "action failed");
    } finally {
      setBusy(false);
    }
  }

  const openDisputes = (view?.disputes ?? []).filter((d) => d.status === "open");
  const bobLots = view?.accounts?.bob?.unsettled ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 pb-24 md:px-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Claims ops
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
          Claims console
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Pause, freeze, and resolve Bind claims with role actors. Caps enforce
          max claim size and open claims per account. Testnet COVER = clawback
          rail.
        </p>
        <div className="mt-3">
          <PersistenceStatus />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Button onClick={createSession} disabled={busy}>
          New ops session + seed
        </Button>
        <div className="min-w-[12rem] flex-1">
          <label className="keel-meta mb-1 block">Session id</label>
          <Input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.trim())}
            placeholder="sess_…"
          />
        </div>
        <Button
          variant="outline"
          disabled={!sessionId || busy}
          onClick={() => refresh(sessionId).catch((e) => setError(String(e)))}
        >
          Refresh
        </Button>
        <div>
          <label className="keel-meta mb-1 block">Actor</label>
          <select
            className="h-11 min-h-[44px] rounded border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)]"
            value={actor}
            onChange={(e) =>
              setActor(e.target.value as (typeof ACTORS)[number])
            }
          >
            {ACTORS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded border border-[var(--color-alert)] bg-[var(--color-alert)] px-3 py-2 text-sm text-black">
          {error}
        </p>
      )}

      {view && (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge tone={view.por?.fullyBacked ? "ok" : "warn"}>
              {view.por?.fullyBacked ? "Peg ok" : "Underbacked"}
            </Badge>
            <Badge tone={view.paused ? "warn" : "mute"}>
              {view.paused ? "Paused" : "Active"}
            </Badge>
            <Badge tone="mute">
              vault {view.por?.vaultUsdc ?? "—"} / supply{" "}
              {view.por?.rUsdcSupply ?? "—"}
            </Badge>
            {view.por?.signature?.sig && (
              <Badge tone="mute">
                PoR sig {view.por.signature.sig.slice(0, 10)}…
              </Badge>
            )}
          </div>

          <section className="space-y-3 border-t border-[var(--keel-line)] pt-6">
            <h2 className="text-lg text-[var(--keel-paper)]">Protocol</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => run({ action: "pause" })}
              >
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => run({ action: "unpause" })}
              >
                Unpause
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  fetch(`/api/v1/sessions/${sessionId}/keeper/settle`, {
                    method: "POST",
                  }).then(() => refresh(sessionId))
                }
              >
                Keeper settle_all
              </Button>
            </div>
          </section>

          <section className="space-y-3 border-t border-[var(--keel-line)] pt-6">
            <h2 className="text-lg text-[var(--keel-paper)]">Freeze (freezer)</h2>
            <p className="text-xs text-[var(--keel-mute)]">
              Bob unsettled lots:{" "}
              {bobLots.length
                ? bobLots.map((l) => `${l.id}${l.frozen ? " (frozen)" : ""}`).join(", ")
                : "none — seed session first"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-[8rem]"
                value={freezeHolder}
                onChange={(e) => setFreezeHolder(e.target.value)}
                placeholder="holder"
              />
              <Input
                className="min-w-[12rem] flex-1"
                value={freezeLotId || bobLots[0]?.id || ""}
                onChange={(e) => setFreezeLotId(e.target.value)}
                placeholder="lot id"
              />
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  run({
                    action: "freeze",
                    to: freezeHolder,
                    lotId: freezeLotId || bobLots[0]?.id,
                    reason: "ops freeze",
                  })
                }
              >
                Freeze lot
              </Button>
            </div>
          </section>

          <section className="space-y-3 border-t border-[var(--color-line)] pt-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
              Audit trail ({view.claims?.length ?? 0})
            </h2>
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
              Claim events
            </p>
            <ul className="max-h-48 space-y-1 overflow-auto border border-[var(--color-line)] bg-[var(--color-surface)] p-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)]">
              {(view.claims ?? []).slice(0, 20).map((c) => (
                <li key={c.id}>
                  {c.created_at?.slice(11, 19) ?? "—"} · {c.action}
                  {c.actor ? ` · ${c.actor}` : ""}
                  {c.lot_id ? ` · ${c.lot_id}` : ""}
                </li>
              ))}
              {(view.claims ?? []).length === 0 && (
                <li>No claim events yet</li>
              )}
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--keel-line)] pt-6">
            <h2 className="text-lg text-[var(--keel-paper)]">
              Open disputes ({openDisputes.length})
            </h2>
            {openDisputes.length === 0 && (
              <p className="text-sm text-[var(--keel-mute)]">
                No open disputes. Freeze a lot or open one from /demo.
              </p>
            )}
            <ul className="space-y-3">
              {openDisputes.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-[var(--keel-line)] px-3 py-2"
                >
                  <div className="text-sm">
                    <div className="text-[var(--keel-paper)]">
                      {d.id} · {d.amount} · {d.claimant}
                    </div>
                    <div className="text-xs text-[var(--keel-mute)]">
                      {d.reason} · lot {d.lotId}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run({
                          action: "resolve",
                          disputeId: d.id,
                          approve: true,
                        })
                      }
                    >
                      Approve recover
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run({
                          action: "resolve",
                          disputeId: d.id,
                          approve: false,
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
