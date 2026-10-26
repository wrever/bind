"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type StepId = "deposit" | "hold" | "settle" | "claim";

const STEPS: StepId[] = ["deposit", "hold", "settle", "claim"];

/** Concept C — Split diagram: sticky SVG path + scrolling step copy. */
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

  // Spine draws through deposit+hold (0–50%). Branches fill settle/claim halves.
  const spineP = Math.min(1, progress / 0.5);
  const settleP =
    active === "settle" || active === "claim"
      ? Math.min(1, Math.max(0, (progress - 0.5) / 0.25))
      : 0;
  const claimP =
    active === "claim" ? Math.min(1, Math.max(0, (progress - 0.75) / 0.25)) : 0;

  const head = headFor(active, spineRef, settleRef, claimRef, spineP, settleP, claimP);
  const timer = holdTimer(progress);

  return (
    <section
      id="quick-demo"
      ref={trackRef}
      className="relative h-[400vh] bg-transparent"
      aria-label={t("title")}
    >
      <div className="sticky top-[60px] z-10 flex h-[calc(100dvh-60px)] w-full items-stretch">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 py-5 md:grid-cols-2 md:gap-10 md:px-8 md:py-8">
          <div className="relative flex min-h-0 flex-col justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]/92 p-4 md:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              {t("eyebrow")}
            </p>
            <div className="mt-3 flex-1">
              <svg
                viewBox="-90 8 260 350"
                className="mx-auto h-[min(48vh,380px)] w-full max-w-[300px] md:h-[min(56vh,460px)]"
                aria-hidden
              >
                <path
                  d="M 40 40 L 40 112 L 40 186 L 40 248"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <path
                  d="M 40 248 L 118 318"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <path
                  d="M 40 248 L -38 318"
                  fill="none"
                  stroke="#3A3934"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />

                <path
                  ref={spineRef}
                  d="M 40 40 L 40 112 L 40 186 L 40 248"
                  fill="none"
                  stroke="#F5F4F0"
                  strokeWidth={2}
                  strokeLinecap="square"
                  strokeDasharray={lens.spine}
                  strokeDashoffset={lens.spine * (1 - spineP)}
                />
                <path
                  ref={settleRef}
                  d="M 40 248 L 118 318"
                  fill="none"
                  stroke="#F5F4F0"
                  strokeWidth={2}
                  strokeLinecap="square"
                  strokeDasharray={lens.settle}
                  strokeDashoffset={lens.settle * (1 - settleP)}
                  opacity={settleP > 0 || active === "settle" ? 1 : 0.35}
                />
                <path
                  ref={claimRef}
                  d="M 40 248 L -38 318"
                  fill="none"
                  stroke={claimP > 0 ? "#F5F4F0" : "#AFAFAC"}
                  strokeWidth={2}
                  strokeLinecap="square"
                  strokeDasharray={lens.claim}
                  strokeDashoffset={lens.claim * (1 - claimP)}
                  opacity={claimP > 0 || active === "claim" ? 1 : 0.35}
                />

                <NodeBox
                  x={40}
                  y={40}
                  label={t("nodeWallet")}
                  lit={active === "deposit"}
                  done={stepIndex > 0}
                />
                <NodeBox
                  x={40}
                  y={112}
                  label={t("nodeRail")}
                  lit={active === "deposit" || active === "hold"}
                  done={stepIndex > 0}
                />
                <NodeBox
                  x={40}
                  y={186}
                  label={t("nodeWindow")}
                  lit={active === "hold"}
                  done={stepIndex > 1}
                  sub={
                    active === "hold" || stepIndex > 1 ? timer : undefined
                  }
                />
                <NodeBox
                  x={118}
                  y={318}
                  label={t("nodeSettled")}
                  lit={active === "settle"}
                  done={active === "settle"}
                />
                <NodeBox
                  x={-38}
                  y={318}
                  label={t("nodeClaim")}
                  lit={active === "claim"}
                  done={active === "claim"}
                  alert={active === "claim"}
                />

                {head ? (
                  <rect
                    x={head.x - 5}
                    y={head.y - 5}
                    width={10}
                    height={10}
                    fill="#F54307"
                  />
                ) : null}
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--color-line)] pt-3 font-[family-name:var(--font-mono)] text-[12px] tabular-nums text-[var(--color-accent2)]">
              <span>Vault 100.00</span>
              <span className="text-[var(--color-muted)]">·</span>
              <span>Supply 100.00</span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col justify-center overflow-y-auto py-2">
            <ul className="space-y-5 md:space-y-7">
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
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                      {item.kicker}
                    </p>
                    <h2
                      className={cn(
                        "mt-1.5 font-[family-name:var(--font-display)] font-extrabold tracking-[-0.025em] text-[var(--color-text)]",
                        on
                          ? "text-[clamp(1.35rem,3.2vw,2.15rem)] leading-[1.15]"
                          : "text-lg leading-snug md:text-xl",
                      )}
                    >
                      {item.title}
                    </h2>
                    {on ? (
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-muted)] md:text-[15px]">
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

function NodeBox({
  x,
  y,
  label,
  lit,
  done,
  sub,
  alert,
}: {
  x: number;
  y: number;
  label: string;
  lit: boolean;
  done: boolean;
  sub?: string;
  alert?: boolean;
}) {
  const border = alert
    ? "#F12A02"
    : lit
      ? "#F54307"
      : done
        ? "#AFAFAC"
        : "#3A3934";
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-54}
        y={-18}
        width={108}
        height={sub ? 46 : 36}
        rx={4}
        fill="#22211E"
        stroke={border}
        strokeWidth={1}
      />
      <text
        textAnchor="middle"
        y={sub ? 2 : 5}
        fill="#F5F4F0"
        fontSize={11}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        letterSpacing="0.04em"
      >
        {label}
      </text>
      {sub ? (
        <text
          textAnchor="middle"
          y={20}
          fill="#01E4FD"
          fontSize={13}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontWeight={600}
        >
          {sub}
        </text>
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
    if (active === "claim" && claim.current && claimP > 0) {
      const len = claim.current.getTotalLength();
      const pt = claim.current.getPointAtLength(len * claimP);
      return { x: pt.x, y: pt.y };
    }
    if (active === "settle" && settle.current) {
      const len = settle.current.getTotalLength();
      const pt = settle.current.getPointAtLength(len * Math.max(0.02, settleP));
      return { x: pt.x, y: pt.y };
    }
    if (spine.current) {
      const len = spine.current.getTotalLength();
      const pt = spine.current.getPointAtLength(len * Math.max(0.02, spineP));
      return { x: pt.x, y: pt.y };
    }
  } catch {
    return null;
  }
  return null;
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
