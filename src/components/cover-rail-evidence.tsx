"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type CoverBlock = {
  assetCode?: string;
  issuer?: string;
  sac?: string;
  flags?: string[];
  smoke?: {
    mintToHolder?: boolean;
    clawbackClaim?: boolean;
    remintToClaimant?: boolean;
  };
  explorer?: { sac?: string; issuer?: string };
  notes?: string;
};

/** Published COVER clawback claims rail (from /api/v1/network). */
export function CoverRailEvidence() {
  const [cover, setCover] = useState<CoverBlock | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/v1/network", { cache: "no-store" });
        const json = (await res.json()) as { cover?: CoverBlock | null };
        setCover(json.cover ?? null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "network fetch failed");
      }
    })();
  }, []);

  return (
    <section className="relative space-y-4 border-t border-[var(--color-line)] pt-10">
      <div>
        <p className="keel-meta">Unlocked · Classic clawback</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
          COVER claims rail
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
          Indemnity mechanism under the hood:{" "}
          <code className="text-[var(--color-accent2)]">AUTH_CLAWBACK_ENABLED</code>{" "}
          mint → clawback → remint. Product language is insurance claim — not a
          consumer brand.
        </p>
      </div>

      {err ? (
        <p className="text-sm text-[var(--color-alert)]">{err}</p>
      ) : null}

      {!cover ? (
        <p className="keel-meta">Loading cover metadata…</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={cover.smoke?.clawbackClaim ? "ok" : "mute"}>
              {cover.smoke?.clawbackClaim
                ? "Clawback smoke passed"
                : "Smoke pending"}
            </Badge>
            {(cover.flags ?? []).map((f) => (
              <Badge key={f} tone="mute">
                {f}
              </Badge>
            ))}
          </div>
          <ul className="space-y-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-muted)] sm:text-[13px]">
            <li>
              Asset{" "}
              <span className="text-[var(--color-accent2)]">
                {cover.assetCode}
              </span>
            </li>
            {cover.issuer ? (
              <li>
                Issuer {cover.issuer.slice(0, 4)}…{cover.issuer.slice(-4)}
                {cover.explorer?.issuer ? (
                  <>
                    {" · "}
                    <a
                      href={cover.explorer.issuer}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent2)] underline underline-offset-4"
                    >
                      explorer
                    </a>
                  </>
                ) : null}
              </li>
            ) : null}
            {cover.sac ? (
              <li>
                SAC {cover.sac.slice(0, 4)}…{cover.sac.slice(-4)}
                {cover.explorer?.sac ? (
                  <>
                    {" · "}
                    <a
                      href={cover.explorer.sac}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent2)] underline underline-offset-4"
                    >
                      explorer
                    </a>
                  </>
                ) : null}
              </li>
            ) : null}
          </ul>
          {cover.notes ? (
            <p className="text-sm text-[var(--color-muted)]">{cover.notes}</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
