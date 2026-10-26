"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import { FadeChip } from "@/components/motion/fade-chip";
import { FlatTimer } from "@/components/motion/flat-timer";
import { SplitRise } from "@/components/motion/split-rise";
import { StatusMark } from "@/components/motion/status-mark";
import { cn } from "@/lib/utils";

type StepId = "deposit" | "hold" | "settle" | "claim";

const STEPS: StepId[] = ["deposit", "hold", "settle", "claim"];

/** Concept C — Split diagram + Bind-native motion (no React Bits license). */
export function CoverScrollDemo() {
  const t = useTranslations("QuickDemo");
  const trackRef = useRef<HTMLElement>(null);
  const spineRef = useRef<SVGPathElement>(null);
  const settleRef = useRef<SVGPathElement>(null);
  const claimRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [lens, setLens] = useState({ spine: 1, settle: 1, claim: 1 });
  const reduceMotion = usePrefersReducedMotion();

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

  useLayoutEffect(() => {
    setLens({
      spine: spineRef.current?.getTotalLength() || 1,
      settle: settleRef.current?.getTotalLength() || 1,
      claim: claimRef.current?.getTotalLength() || 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!track) return;
        if (reduceMotion) {
          setProgress(1);
          return;
        }
        const rect = track.getBoundingClientRect();
        const total = Math.max(1, track.offsetHeight - window.innerHeight);
        const scrolled = Math.min(total, Math.max(0, -rect.top));
        setProgress(scrolled / total);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion]);

  const spineP = Math.min(1, progress / 0.5);
  const settleP =
    active === "settle" || active === "claim"
      ? Math.min(1, Math.max(0, (progress - 0.5) / 0.25))
      : 0;
  const claimP =
    active === "claim" ? Math.min(1, Math.max(0, (progress - 0.75) / 0.25)) : 0;

  const head = headFor(
    active,
    spineRef,
    settleRef,
    claimRef,
    spineP,
    settleP,
    claimP,
  );
  const timer = holdTimer(progress);
  // Deposit wraps 0→100 with scroll; peg stays vault = supply after that.
  const peg = porPeg(progress, reduceMotion);

  return (
    <section
      id="quick-demo"
      ref={trackRef}
      className="relative h-[400vh] bg-transparent"
      aria-label={t("title")}
    >
      <div className="sticky top-[60px] z-10 flex h-[calc(100dvh-60px)] w-full items-stretch">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-6 md:grid-cols-2 md:gap-12 md:px-8 md:py-10 lg:gap-16">
          {/* Solid plate — aurora stays outside the border */}
          <div className="relative flex min-h-0 flex-col justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              {t("eyebrow")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <FadeChip show={stepIndex >= 0} delayMs={0}>
                Cover active
              </FadeChip>
              <FadeChip show={active === "hold" || stepIndex >= 1} delayMs={60}>
                Free exit paused
              </FadeChip>
              <FadeChip show={active === "claim"} delayMs={80} alert>
                Incident
              </FadeChip>
            </div>

            <div className="mt-5 flex-1">
              <svg
                viewBox="-90 8 260 350"
                className="mx-auto h-[min(42vh,340px)] w-full max-w-[300px] md:h-[min(48vh,400px)]"
                aria-hidden
              >
                {/* Connectors run between nodes so the head sits under boxes, not through them */}
                <path
                  d="M 40 60 L 40 93 L 40 131 L 40 161 L 40 214 L 40 228"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 228 L 118 299"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 228 L -38 299"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                <path
                  ref={spineRef}
                  d="M 40 60 L 40 93 L 40 131 L 40 161 L 40 214 L 40 228"
                  fill="none"
                  stroke="#F5F4F0"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={lens.spine}
                  strokeDashoffset={lens.spine * (1 - spineP)}
                />
                <path
                  ref={settleRef}
                  d="M 40 228 L 118 299"
                  fill="none"
                  stroke="#F5F4F0"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray={lens.settle}
                  strokeDashoffset={lens.settle * (1 - settleP)}
                  opacity={settleP > 0 || active === "settle" ? 1 : 0.35}
                />
                <path
                  ref={claimRef}
                  d="M 40 228 L -38 299"
                  fill="none"
                  stroke={claimP > 0 ? "#F5F4F0" : "#AFAFAC"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray={lens.claim}
                  strokeDashoffset={lens.claim * (1 - claimP)}
                  opacity={claimP > 0 || active === "claim" ? 1 : 0.35}
                />

                <NodeBox
                  x={40}
                  y={40}
                  label={t("nodeWallet")}
                  status={nodeStatus(stepIndex, 0, active === "deposit")}
                />
                <NodeBox
                  x={40}
                  y={112}
                  label={t("nodeRail")}
                  status={nodeStatus(
                    stepIndex,
                    0,
                    active === "deposit" || active === "hold",
                  )}
                />
                <NodeBox
                  x={40}
                  y={186}
                  label={t("nodeWindow")}
                  status={nodeStatus(stepIndex, 1, active === "hold")}
                  sub={
                    active === "hold" || stepIndex > 1 ? (
                      <FlatTimer value={timer} className="text-[12px]" />
                    ) : undefined
                  }
                />
                <NodeBox
                  x={118}
                  y={318}
                  label={t("nodeSettled")}
                  status={
                    active === "settle"
                      ? "running"
                      : stepIndex > 2
                        ? "done"
                        : "pending"
                  }
                />
                <NodeBox
                  x={-38}
                  y={318}
                  label={t("nodeClaim")}
                  status={
                    active === "claim"
                      ? "failed"
                      : "pending"
                  }
                  alert={active === "claim"}
                />

                {head ? (
                  <rect
                    x={head.x - 4}
                    y={head.y - 4}
                    width={8}
                    height={8}
                    rx={2}
                    fill="#F54307"
                  />
                ) : null}
              </svg>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[var(--color-line)] pt-4 font-[family-name:var(--font-mono)] text-[12px] tabular-nums text-[var(--color-accent2)]">
              <span>
                Vault <span className="tabular-nums">{peg.vault.toFixed(2)}</span>
              </span>
              <span className="text-[var(--color-muted)]">·</span>
              <span>
                Supply{" "}
                <span className="tabular-nums">{peg.supply.toFixed(2)}</span>
              </span>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 md:p-8">
            <ul className="space-y-6 md:space-y-8">
              {STEPS.map((id, i) => {
                const on = i === stepIndex;
                const done = i < stepIndex;
                const item = labels[id];
                return (
                  <li
                    key={id}
                    className={cn(
                      "transition-opacity duration-200",
                      on ? "opacity-100" : done ? "opacity-55" : "opacity-32",
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
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function nodeStatus(
  stepIndex: number,
  nodeStep: number,
  lit: boolean,
): "pending" | "running" | "done" {
  if (lit) return "running";
  if (stepIndex > nodeStep) return "done";
  return "pending";
}

function NodeBox({
  x,
  y,
  label,
  status,
  sub,
  alert,
}: {
  x: number;
  y: number;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  sub?: ReactNode;
  alert?: boolean;
}) {
  const border = alert
    ? "#F12A02"
    : status === "running"
      ? "#F54307"
      : status === "done"
        ? "#AFAFAC"
        : "#3A3934";
  const h = sub ? 50 : 38;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-56}
        y={-h / 2}
        width={112}
        height={h}
        rx={12}
        ry={12}
        fill="#0E100D"
        stroke={border}
        strokeWidth={status === "running" || alert ? 1.25 : 1}
      />
      <foreignObject x={-48} y={sub ? -14 : -8} width={16} height={16}>
        <div className="flex h-4 w-4 items-center justify-center">
          <StatusMark status={status} size={12} />
        </div>
      </foreignObject>
      <text
        textAnchor="start"
        x={-28}
        y={sub ? 0 : 4}
        fill="#F5F4F0"
        fontSize={11}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        letterSpacing="0.04em"
      >
        {label}
      </text>
      {sub ? (
        <foreignObject x={-48} y={8} width={96} height={22}>
          <div className="flex justify-center">{sub}</div>
        </foreignObject>
      ) : null}
    </g>
  );
}

function headFor(
  active: StepId,
  spine: RefObject<SVGPathElement | null>,
  settle: RefObject<SVGPathElement | null>,
  claim: RefObject<SVGPathElement | null>,
  spineP: number,
  settleP: number,
  claimP: number,
): { x: number; y: number } | null {
  try {
    if (active === "claim" && claim.current) {
      const len = claim.current.getTotalLength();
      const pt = claim.current.getPointAtLength(len * Math.max(0.02, claimP));
      return { x: pt.x, y: pt.y };
    }
    if (active === "settle" && settle.current) {
      const len = settle.current.getTotalLength();
      const pt = settle.current.getPointAtLength(len * Math.max(0.02, settleP));
      return { x: pt.x, y: pt.y };
    }
    if (spine.current) {
      const len = spine.current.getTotalLength();
      // Keep head on the connector under Wallet at start (never mid-label)
      const pt = spine.current.getPointAtLength(
        len * Math.min(1, Math.max(0.001, spineP)),
      );
      return { x: pt.x, y: pt.y };
    }
  } catch {
    return null;
  }
  return null;
}

/** Scroll-linked PoR strip: wrap-in on deposit, then peg holds 100 = 100. */
function porPeg(progress: number, reduceMotion: boolean) {
  if (reduceMotion) return { vault: 100, supply: 100 };
  const wrap = Math.min(1, Math.max(0, progress / 0.22));
  const eased = 1 - Math.pow(1 - wrap, 2);
  const n = 100 * eased;
  return { vault: n, supply: n };
}

function holdTimer(progress: number): string {
  const local = Math.min(1, Math.max(0, (progress - 0.25) / 0.25));
  const total = 12 * 3600;
  const left = Math.round(total * (1 - local * 0.62));
  const h = Math.floor(left / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((left % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(left % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
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
