"use client";

import { useEffect, useState } from "react";
import { createInitialState, migrateState, por } from "@/lib/keel/engine";
import type { KeelState } from "@/lib/keel/types";
import { formatUsd } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "keel-demo-state-v1";

export function PorPanel() {
  const [state, setState] = useState<KeelState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(
        raw
          ? migrateState(JSON.parse(raw) as KeelState)
          : createInitialState(),
      );
    } catch {
      setState(createInitialState());
    }
    const onFocus = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState(migrateState(JSON.parse(raw) as KeelState));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("focus", onFocus);
    const t = setInterval(onFocus, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  }, []);

  if (!state) {
    return <p className="px-5 text-[var(--keel-mute)] md:px-10">Loading reserves…</p>;
  }

  const r = por(state);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 pb-20 md:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--keel-sea)]">
          Cover pool solvency
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--keel-paper)] md:text-4xl">
          Proof of reserves
        </h1>
        <p className="mt-2 text-sm text-[var(--keel-mute)]">
          Solvency of the cover pool: vault USDC must back covered supply.
          Demo reads local console state; testnet exposes on-chain{" "}
          <code className="text-[var(--keel-sea)]">por()</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={r.fullyBacked ? "ok" : "warn"}>
          {r.fullyBacked ? "USDC_vault ≥ rUSDC_supply" : "Underbacked"}
        </Badge>
        <Badge tone="mute">as of {new Date(r.asOf).toLocaleString()}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat title="Vault USDC" value={formatUsd(r.vaultUsdc)} />
        <Stat title="rUSDC supply" value={formatUsd(r.rUsdcSupply)} />
        <Stat title="Settled" value={formatUsd(r.settledSupply)} />
        <Stat title="Unsettled" value={formatUsd(r.unsettledSupply)} />
        <Stat title="Exit pool" value={formatUsd(r.exitPoolUsdc)} />
        <Stat title="Protocol fees" value={formatUsd(r.protocolFeesEarned)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backing ratio</CardTitle>
          <CardDescription>
            Target is ≥ 1.0 at all times. Exit Pool liquidity is separate working
            capital.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--keel-sea)]">
            {r.ratio.toFixed(4)}
          </p>
          <p className="mt-3 text-sm text-[var(--keel-mute)]">
            Exit Pool liquidity: {formatUsd(state.exitPoolUsdc)} USDC
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/demo">Open console to move funds</Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
