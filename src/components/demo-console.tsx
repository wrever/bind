"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
import { formatRetentionHuman } from "@/lib/keel/retention";
import { formatUsd } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

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
  const t = useTranslations("Demo");
  const [state, setState] = useState<KeelState | null>(null);
  const [actor, setActor] = useState("alice");
  const [amount, setAmount] = useState("100");
  const [to, setTo] = useState("bob");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
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
      <div className="px-5 py-16 text-[var(--color-muted)] md:px-10">…</div>
    );
  }

  const guide = [t("guide1"), t("guide2"), t("guide3"), t("guide4")];

  return (
    <div className="relative mx-auto max-w-5xl space-y-10 px-5 pb-20 pt-10 md:px-10 md:pb-24 md:pt-14">
      <header className="border-b border-[var(--color-line)] pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {t("meta")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.5vw,2.75rem)] font-extrabold tracking-[-0.03em] text-[var(--color-text)]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--color-muted)]">
          {t("body")}
        </p>

        <ol className="mt-6 grid gap-2 sm:grid-cols-2">
          {guide.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-muted)]"
            >
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-accent2)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={
              state.config.retentionProfile === "standard" ? "default" : "outline"
            }
            onClick={() =>
              run(
                (s) => applyRetentionProfile(s, "standard"),
                t("msgLaneStandard"),
              )
            }
          >
            {t("laneStandard")}
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
                t("msgLaneFast"),
              )
            }
          >
            {t("laneFast")}
          </Button>
          <Badge tone={reserves.fullyBacked ? "ok" : "warn"}>
            {reserves.fullyBacked ? t("backed") : t("pegBroken")}
          </Badge>
          <Badge tone="mute">
            {t("hold", {
              time: formatRetentionHuman(state.config.windowMs),
            })}
          </Badge>
        </div>

        <p className="mt-5 text-sm text-[var(--color-muted)]">
          {t("dualNote")}{" "}
          <Link
            href="/live"
            className="text-[var(--color-accent2)] underline underline-offset-4"
          >
            {t("dualCta")}
          </Link>
        </p>
      </header>

      {(error || msg) && (
        <div
          className={`border px-4 py-3 text-sm ${
            error
              ? "border-[var(--color-alert)]/40 text-[var(--color-alert)]"
              : "border-[var(--color-accent2)]/30 text-[var(--color-accent2)]"
          }`}
        >
          {error ?? msg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
            {t("actorTitle")}
          </h2>
          <p className="text-xs text-[var(--color-muted)]">{t("actorBody")}</p>
          <div className="space-y-2">
            {DEMO_ADDRESSES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setActor(a)}
                className={`flex w-full min-h-[44px] items-center justify-between px-3 py-2 text-left text-sm capitalize ${
                  actor === a
                    ? "bg-[var(--color-accent)] font-semibold text-black"
                    : "border border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-line-strong)]"
                }`}
              >
                <span>{a}</span>
                <span className="text-xs opacity-80">
                  {formatUsd(
                    (state.accounts[a]?.settled ?? 0) +
                      (state.accounts[a]?.unsettled.reduce(
                        (s, l) => s + l.amount,
                        0,
                      ) ?? 0),
                    0,
                  )}
                </span>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              run((s) => createInitialState(s.config), t("msgReset"))
            }
          >
            {t("reset")}
          </Button>
        </section>

        <div className="space-y-6">
          <section className="border border-[var(--color-line)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold capitalize text-[var(--color-text)]">
              {actor} · {t("balances")}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label={t("usdcFree")} value={formatUsd(account.usdc)} />
              <Row
                label={t("settled")}
                value={formatUsd(account.settled)}
                hint={t("hintUnwrap")}
              />
              <Row
                label={t("unsettled")}
                value={formatUsd(
                  account.unsettled.reduce((s, l) => s + l.amount, 0),
                )}
                hint={t("hintWindow")}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  run((s) => faucet(s, actor, 500), t("msgFaucet"))
                }
              >
                {t("faucet")}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  run(
                    (s) => deposit(s, actor, n),
                    t("msgDeposit", { n }),
                  )
                }
              >
                {t("deposit")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run((s) => settle(s, actor, now), t("msgSettle"))
                }
              >
                {t("settleReady")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run((s) => settleAll(s, now), t("msgSettleAll"))
                }
              >
                {t("settleAll")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run(
                    (s) => unwrap(s, actor, n),
                    t("msgUnwrap", { n }),
                  )
                }
              >
                {t("unwrap")}
              </Button>
            </div>
          </section>

          <section className="border border-[var(--color-line)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
              {t("actionsTitle")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs text-[var(--color-muted)]">
                {t("amount")}
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                />
              </label>
              <label className="space-y-1 text-xs text-[var(--color-muted)]">
                {t("to")}
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex h-10 w-full border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)]"
                >
                  {DEMO_ADDRESSES.filter((a) => a !== actor).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  run(
                    (s) => transfer(s, actor, to, n),
                    t("msgTransfer", { n }),
                  )
                }
              >
                {t("transfer")}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  run((s) => exitPool(s, actor, n), t("msgExit"))
                }
              >
                {t("exitPool")}
              </Button>
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              {t("exitFee", {
                fee: state.config.exitFeeBps / 100,
                pool: formatUsd(state.exitPoolUsdc),
              })}
            </p>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-[var(--color-line)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
            {t("lotsTitle")}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("lotsBody")}</p>
          <div className="mt-4 space-y-2">
            {Object.values(state.accounts).flatMap((acc) =>
              acc.unsettled.map((lot) => {
                const rem = remainingMs(lot, now, state.config.windowMs);
                const ready = rem === 0 && !lot.frozen;
                return (
                  <div
                    key={lot.id}
                    className="flex flex-col gap-2 border border-[var(--color-line)] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[var(--color-text)]">
                          {formatUsd(lot.amount)}
                        </span>
                        <Badge tone={lot.frozen ? "warn" : ready ? "ok" : "sea"}>
                          {lot.frozen
                            ? t("frozen")
                            : ready
                              ? t("settleReadyBadge")
                              : t("protectedSecs", {
                                  secs: (rem / 1000).toFixed(0),
                                })}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {lot.from} → {acc.address}
                      </p>
                    </div>
                    {!lot.frozen ? (
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
                            t("msgDispute"),
                          )
                        }
                      >
                        {t("dispute")}
                      </Button>
                    ) : null}
                  </div>
                );
              }),
            )}
            {Object.values(state.accounts).every(
              (a) => a.unsettled.length === 0,
            ) ? (
              <p className="text-sm text-[var(--color-muted)]">{t("noLots")}</p>
            ) : null}
          </div>
        </section>

        <section className="border border-[var(--color-line)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
            {t("disputesTitle")}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t("disputesBody")}
          </p>
          <div className="mt-4 space-y-2">
            {state.disputes.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">{t("noDisputes")}</p>
            ) : null}
            {state.disputes.map((d) => (
              <div
                key={d.id}
                className="border border-[var(--color-line)] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--color-text)]">
                    {formatUsd(d.amount)}
                  </span>
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
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {d.claimant}
                </p>
                {d.status === "open" ? (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        run(
                          (s) => resolveDispute(s, d.id, true),
                          t("msgApprove"),
                        )
                      }
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(
                          (s) => resolveDispute(s, d.id, false),
                          t("msgReject"),
                        )
                      }
                    >
                      {t("reject")}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
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
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)]/60 pb-2">
      <span className="text-[var(--color-muted)]">
        {label}
        {hint ? (
          <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="font-[family-name:var(--font-display)] text-lg text-[var(--color-text)]">
        {value}
      </span>
    </div>
  );
}
