"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type ChainPorPayload = {
  mode: string;
  vault: string;
  asOf: string;
  explorer?: { vault: string; deployTx?: string };
  por: {
    vaultUsdc: string;
    supply: string;
    settled: string;
    unsettled: string;
    exitPool: string;
    feesEarned: string;
    paused: boolean;
    fullyBacked: boolean;
  };
};

type State =
  | { status: "loading" }
  | { status: "ok"; data: ChainPorPayload }
  | { status: "err"; message: string; explorer?: { vault: string; deployTx?: string } };

function stroopsToUsdc(raw: string): string {
  try {
    const n = BigInt(raw);
    const scale = BigInt(10_000_000);
    const whole = n / scale;
    const frac = (n % scale).toString().padStart(7, "0").slice(0, 2);
    return `${whole.toLocaleString()}.${frac}`;
  } catch {
    return raw;
  }
}

/** Live testnet vault PoR via /api/v1/chain/por (RPC simulate). */
export function ChainStatus() {
  const [state, setState] = useState<State>({ status: "loading" });

  async function load() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/v1/chain/por", { cache: "no-store" });
      const json = (await res.json()) as ChainPorPayload & {
        message?: string;
        explorer?: { vault: string; deployTx?: string };
      };
      if (!res.ok) {
        setState({
          status: "err",
          message: json.message ?? "RPC unavailable",
          explorer: json.explorer,
        });
        return;
      }
      setState({ status: "ok", data: json });
    } catch (e) {
      setState({
        status: "err",
        message: e instanceof Error ? e.message : "fetch failed",
      });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="relative space-y-6 border-t border-[var(--color-line)] pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="keel-meta">On-chain · Stellar testnet</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
            Live vault PoR
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            Read-only RPC simulate of{" "}
            <code className="text-[var(--color-accent2)]">por()</code> on the
            published Bind vault — separate from the local demo engine above.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {state.status === "loading" ? (
        <p className="keel-meta">Querying Soroban RPC…</p>
      ) : null}

      {state.status === "err" ? (
        <div className="border border-[var(--color-line)] bg-[var(--color-bg)] p-5">
          <Badge tone="warn">RPC offline</Badge>
          <p className="mt-3 text-sm text-[var(--color-muted)]">{state.message}</p>
          {state.explorer?.vault ? (
            <a
              href={state.explorer.vault}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-[var(--color-accent2)] underline underline-offset-4"
            >
              Open vault on stellar.expert
            </a>
          ) : null}
        </div>
      ) : null}

      {state.status === "ok" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone={state.data.por.fullyBacked ? "ok" : "warn"}>
              {state.data.por.fullyBacked ? "Peg held on-chain" : "Underbacked"}
            </Badge>
            <Badge tone="mute">
              {state.data.vault.slice(0, 4)}…{state.data.vault.slice(-4)}
            </Badge>
            <Badge tone="mute">
              as of {new Date(state.data.asOf).toLocaleString()}
            </Badge>
          </div>

          <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Vault USDC", state.data.por.vaultUsdc],
                ["Supply", state.data.por.supply],
                ["Settled", state.data.por.settled],
                ["Unsettled", state.data.por.unsettled],
                ["Exit pool", state.data.por.exitPool],
                ["Fees", state.data.por.feesEarned],
              ] as const
            ).map(([title, raw]) => (
              <div key={title} className="bg-[var(--color-bg)] px-5 py-5">
                <p className="keel-meta !normal-case !tracking-[0.06em]">
                  {title}
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)]">
                  {stroopsToUsdc(raw)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {state.data.explorer?.vault ? (
              <a
                href={state.data.explorer.vault}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent2)] underline underline-offset-4"
              >
                Vault explorer
              </a>
            ) : null}
            {state.data.explorer?.deployTx ? (
              <a
                href={state.data.explorer.deployTx}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent2)] underline underline-offset-4"
              >
                Deploy tx
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Honest dual-track note for demo / integrate surfaces. */
export function DualTrackNote() {
  return (
    <aside className="border border-[var(--color-line)] bg-[var(--color-surface)]/40 px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]">
      <span className="font-[family-name:var(--font-display)] font-extrabold text-[var(--color-text)]">
        Dual track.{" "}
      </span>
      This UI drives the Bind policy engine (simulator). The Unlocked vault +
      COVER clawback rail are live on Stellar testnet — PoR and explorer links on{" "}
      <Link
        href="/por"
        className="text-[var(--color-accent2)] underline underline-offset-4"
      >
        /por
      </Link>
      .
    </aside>
  );
}
