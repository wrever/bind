"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LotLifecycleDiagram,
  type LotStep,
} from "@/components/lot-lifecycle-diagram";
import { SplitRise } from "@/components/motion/split-rise";
import { StatusMark } from "@/components/motion/status-mark";
import { cn } from "@/lib/utils";

const STEPS: LotStep[] = ["deposit", "hold", "settle", "claim"];
/** Full loop — a bit snappier so the orange beam reads clearly. */
const CYCLE_MS = 11_000;
/** After a manual step tap, freeze so the copy is readable. */
const SEEK_HOLD_MS = 2_800;

/** Concept C / D3 — vault-ring lot lifecycle + Bind-native autoplay. */
export function CoverScrollDemo() {
  const t = useTranslations("QuickDemo");
  const trackRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  const playOffset = useRef(0);
  const playStartedAt = useRef(0);
  const progressRef = useRef(0);
  const visibleRef = useRef(false);
  const holdUntilRef = useRef(0);

  const stepIndex = Math.min(
    STEPS.length - 1,
    Math.floor(progress * STEPS.length),
  );
  const active = STEPS[stepIndex];

  const labels = useMemo(
    () =>
      ({
        deposit: {
          kicker: t("s1Kicker"),
          title: t("s1Title"),
          body: t("s1Body"),
        },
        hold: {
          kicker: t("s2Kicker"),
          title: t("s2Title"),
          body: t("s2Body"),
        },
        settle: {
          kicker: t("s4SettleKicker"),
          title: t("s4SettleTitle"),
          body: t("s4SettleBody"),
        },
        claim: {
          kicker: t("s4ClaimKicker"),
          title: t("s4ClaimTitle"),
          body: t("s4ClaimBody"),
        },
      }) as const,
    [t],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (reduceMotion) {
      setProgress(1);
      progressRef.current = 1;
      return;
    }

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visibleRef.current) return;
      if (now < holdUntilRef.current) return;
      if (!playStartedAt.current) playStartedAt.current = now;
      const next =
        (playOffset.current + (now - playStartedAt.current) / CYCLE_MS) % 1;
      progressRef.current = next;
      setProgress(next);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting && entry.intersectionRatio >= 0.28;
        if (on && !visibleRef.current) {
          visibleRef.current = true;
          playStartedAt.current = 0;
        } else if (!on && visibleRef.current) {
          visibleRef.current = false;
          playOffset.current = progressRef.current;
          playStartedAt.current = 0;
        }
      },
      { threshold: [0, 0.28, 0.5, 0.75] },
    );
    io.observe(track);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      visibleRef.current = false;
    };
  }, [reduceMotion]);

  function seekStep(i: number) {
    const next = Math.min(0.97, (i + 0.06) / STEPS.length);
    playOffset.current = next;
    playStartedAt.current = 0;
    progressRef.current = next;
    setProgress(next);
    holdUntilRef.current = performance.now() + SEEK_HOLD_MS;
    visibleRef.current = true;
  }

  const peg = porPeg(progress, active, reduceMotion);
  const timer = holdTimer(progress, active);
  const pegHint =
    active === "deposit"
      ? t("pegHintDeposit")
      : active === "hold"
        ? t("pegHintHold")
        : active === "settle"
          ? t("pegHintSettle")
          : t("pegHintClaim");
  const stepLocal = progress * STEPS.length - stepIndex;
  const barDeposit =
    stepIndex === 0 ? clamp01(stepLocal) : stepIndex > 0 ? 1 : 0;
  const barHold = stepIndex === 1 ? clamp01(stepLocal) : stepIndex > 1 ? 1 : 0;
  const barOutcome =
    stepIndex >= 2 ? clamp01((progress - 0.5) / 0.5) : 0;

  return (
    <section
      id="quick-demo"
      ref={trackRef}
      className="relative bg-transparent py-10 md:py-14"
      aria-label={t("title")}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2 md:gap-12 md:px-8 lg:gap-16">
        <div className="relative flex min-h-0 flex-col justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 md:p-8">
          <LotLifecycleDiagram
            step={active}
            progress={progress}
            cycleMs={CYCLE_MS}
            timer={timer}
            vault={peg.vault}
            supply={peg.supply}
            pegHint={pegHint}
            example={peg.example}
            labels={{
              fig: t("eyebrow"),
              wallet: t("nodeWallet"),
              rail: t("nodeRail"),
              settled: t("nodeSettled"),
              claim: t("nodeClaim"),
              retention: t("nodeWindow"),
              incident: "Incident",
            }}
          />
        </div>

        <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 md:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            {t("title")}
          </p>
          <ul className="mt-6 space-y-6 md:space-y-8">
            {STEPS.map((id, i) => {
              const on = i === stepIndex;
              const done = i < stepIndex;
              const item = labels[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => seekStep(i)}
                    className={cn(
                      "w-full rounded-lg text-left transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                      on ? "opacity-100" : done ? "opacity-55" : "opacity-32",
                      !on && "hover:opacity-80",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <StatusMark
                        status={on ? "running" : done ? "done" : "pending"}
                        size={14}
                      />
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                        {item.kicker}
                      </p>
                    </div>
                    {on ? (
                      <SplitRise
                        text={item.title}
                        playKey={id}
                        reduceMotion={reduceMotion}
                        className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.35rem,3.2vw,2.15rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-[var(--color-text)]"
                      />
                    ) : (
                      <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-extrabold leading-snug tracking-[-0.025em] text-[var(--color-text)] md:text-xl">
                        {item.title}
                      </h2>
                    )}
                    {on ? (
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)] md:text-[15px]">
                        {item.body}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[var(--color-line)] pt-5">
            <PhaseBar label={t("stepDeposit")} value={barDeposit} />
            <PhaseBar label={t("stepHold")} value={barHold} />
            <PhaseBar label={t("stepResult")} value={barOutcome} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
        {label}
      </p>
      <div className="mt-2 h-1 overflow-hidden bg-[var(--color-line)]">
        <div
          className="h-full bg-[var(--color-accent)] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(clamp01(value) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function porPeg(
  progress: number,
  step: LotStep,
  reduceMotion: boolean,
): { vault: number; supply: number; example: string } {
  if (reduceMotion || step !== "deposit") {
    // Settled: both sides drop together after unwrap. Claim: remint keeps peg.
    if (step === "settle") {
      return { vault: 0, supply: 0, example: "−100 USDC unwrap" };
    }
    if (step === "claim") {
      return { vault: 100, supply: 100, example: "claim +100 cover" };
    }
    return { vault: 100, supply: 100, example: "100 USDC covered" };
  }
  const wrap = Math.min(1, Math.max(0, progress / 0.25));
  const eased = 1 - Math.pow(1 - wrap, 2);
  const n = 100 * eased;
  return { vault: n, supply: n, example: "+100 USDC wrap" };
}

/** Hold counts 12h → 00:00:00; only then do settle/claim show zero. */
function holdTimer(progress: number, step: LotStep): string {
  if (step === "deposit") return "12:00:00";
  if (step === "settle" || step === "claim") return "00:00:00";
  const local = Math.min(1, Math.max(0, (progress - 0.25) / 0.25));
  const total = 12 * 3600;
  const left = Math.round(total * (1 - local));
  return formatHms(left);
}

function formatHms(totalSec: number) {
  const h = Math.floor(totalSec / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const fn = () => setReduce(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduce;
}
