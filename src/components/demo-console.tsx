"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyRetentionProfile,
  createInitialState,
  deposit,
  exitPool,
  faucet,
  migrateState,
  openDisputeAsSender,
  por,
  remainingMs,
  resolveDispute,
  settle,
  settleAll,
  transfer,
  unwrap,
  DEMO_ADDRESSES,
} from "@/lib/keel/engine";
import type { KeelState, RetentionProfileId } from "@/lib/keel/types";
import {
  formatRetentionHuman,
  RETENTION_COPY,
  RETENTION_PROFILES,
} from "@/lib/keel/retention";
import { formatUsd } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FreighterConnect } from "@/components/freighter-connect";
import { PersistenceStatus } from "@/components/persistence-status";

const STORAGE_KEY = "keel-demo-state-v1";

function loadState(): KeelState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw) as KeelState);
  } catch {
    /* ignore */
  }
  return createInitialState();
}

export function DemoConsole() {
  const [state, setState] = useState<KeelState | null>(null);
  const [actor, setActor] = useState<string>("alice");
  const [amount, setAmount] = useState("100");
  const [to, setTo] = useState("bob");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!state) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const reserves = useMemo(() => (state ? por(state) : null), [state]);
  const account = state?.accounts[actor];

  function run(fn: (s: KeelState) => KeelState, ok?: string) {
    if (!state) return;
    try {
      setError(null);
      setState(fn(state));
      setMsg(ok ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setMsg(null);
    }
  }

  const n = Number(amount);
  if (!state || !reserves || !account) {
    return (
      <div className="px-5 py-16 text-[var(--keel-mute)] md:px-10">
        Loading Bind console…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-5 pb-20 md:px-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="keel-meta">[ DM-001 ] · Bind console · Retention Cover</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
            Bind console
          </h1>
          <div className="mt-3 md:hidden">
            <FreighterConnect />
          </div>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            {RETENTION_PROFILES[state.config.retentionProfile].blurb} Demo clock:{" "}
            {formatRetentionHuman(state.config.windowMs)} (prod{" "}
            {formatRetentionHuman(
              RETENTION_PROFILES[state.config.retentionProfile].windowMs,
            )}
            ). {RETENTION_COPY.freeExit}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={
                state.config.retentionProfile === "standard"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                run(
                  (s) => applyRetentionProfile(s, "standard"),
                  "Lane: Protected 12h (no KYC)",
                )
              }
            >
              No KYC · 12h
            </Button>
            <Button
              size="sm"
              variant={
                state.config.retentionProfile === "kyc_fast_lane"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                run(
                  (s) =>
                    applyRetentionProfile(s, "kyc_fast_lane" as RetentionProfileId, {
                      kycAttested: true,
                    }),
                  "Lane: KYC Fast Lane",
                )
              }
            >
              KYC Fast Lane
            </Button>
          </div>
          <div className="mt-3">
            <PersistenceStatus />
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="hidden md:block">
            <FreighterConnect />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="sea">
              {RETENTION_PROFILES[state.config.retentionProfile].badge}
            </Badge>
            <Badge tone={reserves.fullyBacked ? "ok" : "warn"}>
              {reserves.fullyBacked ? "Fully backed" : "Peg broken"}
            </Badge>
            {reserves.paused ? <Badge tone="warn">Paused</Badge> : null}
            <Badge tone="mute">Vault {formatUsd(reserves.vaultUsdc)} USDC</Badge>
            <Badge tone="mute">
              Hold {formatRetentionHuman(state.config.windowMs)}
            </Badge>
          </div>
        </div>
      </div>

      {(error || msg) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-[var(--keel-coral)]/40 bg-[var(--keel-coral)]/10 text-[var(--keel-coral)]"
              : "border-[var(--keel-sea)]/30 bg-[var(--keel-sea)]/10 text-[var(--keel-sea-bright)]"
          }`}
        >
          {error ?? msg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Actor</CardTitle>
            <CardDescription>Who signs the next action</CardDescription>
          </CardHeader>
          <CardBody className="space-y-2">
            {DEMO_ADDRESSES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setActor(a)}
                className={`flex w-full min-h-[44px] items-center justify-between rounded px-3 py-2 text-left text-sm capitalize transition-colors ${
                  actor === a
                    ? "bg-[var(--color-accent)] text-black font-semibold"
                    : "bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-line-strong)] border border-[var(--color-line)]"
                }`}
              >
                <span>{a}</span>
                <span className="text-xs opacity-80">
                  {formatUsd(
                    (state.accounts[a]?.settled ?? 0) +
                      (state.accounts[a]?.unsettled.reduce((s, l) => s + l.amount, 0) ?? 0),
                    0,
                  )}
                </span>
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() =>
                run((s) => createInitialState(s.config), "Demo reset")
              }
            >
              Reset demo
            </Button>
          </CardBody>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{actor}</CardTitle>
              <CardDescription>Balances</CardDescription>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="USDC (free)" value={formatUsd(account.usdc)} />
              <Row label="rUSDC settled" value={formatUsd(account.settled)} hint="unwrap OK" />
              <Row
                label="rUSDC unsettled"
                value={formatUsd(
                  account.unsettled.reduce((s, l) => s + l.amount, 0),
                )}
                hint="in window"
              />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => run((s) => faucet(s, actor, 500), "+500 USDC faucet")}
                >
                  Faucet +500
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    run((s) => deposit(s, actor, n), `Deposited ${n} → settled rUSDC`)
                  }
                >
                  Deposit / wrap
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run((s) => settle(s, actor, now), "Settled expired lots")
                  }
                >
                  Settle ready
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run((s) => settleAll(s, now), "Keeper settle_all")
                  }
                >
                  Settle all
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run((s) => unwrap(s, actor, n), `Unwrapped ${n} to USDC`)
                  }
                >
                  Unwrap settled
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Amount & destination</CardDescription>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-[var(--keel-mute)]">
                  Amount
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                  />
                </label>
                <label className="space-y-1 text-xs text-[var(--keel-mute)]">
                  To
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[var(--keel-line)] bg-[var(--keel-ink)] px-3 text-sm text-[var(--keel-paper)]"
                  >
                    {DEMO_ADDRESSES.filter((a) => a !== actor).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    run(
                      (s) => transfer(s, actor, to, n),
                      `Sent ${n} rUSDC → ${to} (unsettled)`,
                    )
                  }
                >
                  Transfer recoverable
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    run(
                      (s) => exitPool(s, actor, n),
                      `Exit Pool: paid fee, got USDC now`,
                    )
                  }
                >
                  Exit Pool (instant)
                </Button>
              </div>
              <p className="text-xs text-[var(--keel-mute)]">
                Exit fee: {state.config.exitFeeBps / 100}% · Pool liquidity{" "}
                {formatUsd(state.exitPoolUsdc)} USDC
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Protected lots</CardTitle>
            <CardDescription>
              Retention countdown — free unwrap blocked until settle. Frozen =
              claim path.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-2">
            {Object.values(state.accounts).flatMap((acc) =>
              acc.unsettled.map((lot) => {
                const rem = remainingMs(lot, now, state.config.windowMs);
                const ready = rem === 0 && !lot.frozen;
                return (
                  <div
                    key={lot.id}
                    className="flex flex-col gap-2 rounded-lg border border-[var(--keel-line)] bg-[var(--keel-ink)]/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[var(--keel-paper)]">
                          {formatUsd(lot.amount)} rUSDC
                        </span>
                        <Badge tone={lot.frozen ? "warn" : ready ? "ok" : "sea"}>
                          {lot.frozen
                            ? "frozen"
                            : ready
                              ? "settle ready"
                              : `Protected ${(rem / 1000).toFixed(0)}s`}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[var(--keel-mute)]">
                        {lot.from} → {acc.address} · {lot.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!lot.frozen && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            run(
                              (s) =>
                                openDisputeAsSender(
                                  s,
                                  lot.from,
                                  acc.address,
                                  lot.id,
                                  "Suspected theft / phishing",
                                ),
                              "Dispute opened — lot frozen",
                            )
                          }
                        >
                          Dispute (as {lot.from})
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }),
            )}
            {Object.values(state.accounts).every((a) => a.unsettled.length === 0) && (
              <p className="text-sm text-[var(--keel-mute)]">
                No unsettled lots. Transfer rUSDC to start a recovery window.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disputes / arbiter</CardTitle>
            <CardDescription>
              Approve burns holder lot and remints settled to claimant.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-2">
            {state.disputes.length === 0 && (
              <p className="text-sm text-[var(--keel-mute)]">No disputes yet.</p>
            )}
            {state.disputes.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-[var(--keel-line)] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{d.id}</span>
                  <Badge
                    tone={
                      d.status === "open"
                        ? "warn"
                        : d.status === "approved"
                          ? "ok"
                          : "mute"
                    }
                  >
                    {d.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--keel-mute)]">
                  Claimant {d.claimant} · {formatUsd(d.amount)} · {d.reason}
                </p>
                {d.status === "open" && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        run(
                          (s) => resolveDispute(s, d.id, true),
                          "Recover approved",
                        )
                      }
                    >
                      Approve recover
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(
                          (s) => resolveDispute(s, d.id, false),
                          "Dispute rejected",
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event log</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="max-h-56 space-y-1 overflow-auto font-mono text-xs text-[var(--keel-mute)]">
            {state.events.map((e, i) => (
              <li key={`${e.at}-${i}`}>
                {new Date(e.at).toLocaleTimeString()} · {JSON.stringify(e)}
              </li>
            ))}
            {state.events.length === 0 && <li>No events yet.</li>}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--keel-line)]/60 pb-2">
      <span className="text-[var(--keel-mute)]">
        {label}
        {hint ? <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">{hint}</span> : null}
      </span>
      <span className="font-[family-name:var(--font-display)] text-lg text-[var(--keel-paper)]">
        {value}
      </span>
    </div>
  );
}
