"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createInitialState, migrateState, por } from "@/lib/keel/engine";
import type { KeelState } from "@/lib/keel/types";
import { formatUsd } from "@/lib/utils";
import { ChainStatus } from "@/components/chain-status";
import { CoverRailEvidence } from "@/components/cover-rail-evidence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "keel-demo-state-v1";

export function PorPanel() {
  const t = useTranslations("Por");
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
    const timer = setInterval(onFocus, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, []);

  if (!state) {
    return (
      <p className="px-5 py-16 text-[var(--color-muted)] md:px-10">
        {t("loading")}
      </p>
    );
  }

  const r = por(state);
  const stats = [
    { title: t("vaultUsdc"), value: formatUsd(r.vaultUsdc) },
    { title: t("supply"), value: formatUsd(r.rUsdcSupply) },
    { title: t("settled"), value: formatUsd(r.settledSupply) },
    { title: t("unsettled"), value: formatUsd(r.unsettledSupply) },
    { title: t("exitPool"), value: formatUsd(r.exitPoolUsdc) },
    { title: t("fees"), value: formatUsd(r.protocolFeesEarned) },
  ];

  return (
    <div className="relative mx-auto max-w-5xl space-y-12 px-5 pb-20 pt-10 md:px-10 md:pb-24 md:pt-14">
      <header className="relative border-b border-[var(--color-line)] pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {t("meta")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.5vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--color-text)]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
          {t("body")}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone={r.fullyBacked ? "ok" : "warn"}>
            {r.fullyBacked ? t("backed") : t("underbacked")}
          </Badge>
        </div>
      </header>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {t("localTitle")}
        </p>
        <div className="mt-4 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.title}
              className="bg-[var(--color-bg)] px-5 py-6 sm:px-6 sm:py-7"
            >
              <p className="text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
                {s.title}
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[var(--color-text)] md:text-3xl">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="relative border-t border-[var(--color-line)] pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {t("ratioTitle")}
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--color-accent2)] md:text-6xl">
          {r.ratio.toFixed(4)}
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-muted)]">
          {t("ratioBody", { pool: formatUsd(state.exitPoolUsdc) })}
        </p>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/demo">{t("openDemo")}</Link>
          </Button>
        </div>
      </section>

      <ChainStatus />
      <CoverRailEvidence />
    </div>
  );
}
