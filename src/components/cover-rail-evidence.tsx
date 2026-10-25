"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type CoverBlock = {
  assetCode?: string;
  issuer?: string;
  sac?: string;
  flags?: string[];
  smoke?: { clawbackClaim?: boolean };
  explorer?: { sac?: string; issuer?: string };
  notes?: string;
};

export function CoverRailEvidence() {
  const t = useTranslations("Por");
  const [cover, setCover] = useState<CoverBlock | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/v1/network", { cache: "no-store" });
        const json = (await res.json()) as { cover?: CoverBlock | null };
        setCover(json.cover ?? null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "error");
      }
    })();
  }, []);

  return (
    <section className="relative space-y-4 border-t border-[var(--color-line)] pt-10">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
          {t("coverTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
          {t("coverBody")}
        </p>
      </div>

      {err ? (
        <p className="text-sm text-[var(--color-alert)]">{err}</p>
      ) : null}

      {!cover ? (
        <p className="text-xs text-[var(--color-muted)]">{t("coverLoading")}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={cover.smoke?.clawbackClaim ? "ok" : "mute"}>
              {cover.smoke?.clawbackClaim ? t("coverOk") : t("coverPending")}
            </Badge>
          </div>
          {cover.explorer?.sac ? (
            <a
              href={cover.explorer.sac}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-[var(--color-accent2)] underline underline-offset-4"
            >
              explorer
            </a>
          ) : null}
        </div>
      )}
    </section>
  );
}
