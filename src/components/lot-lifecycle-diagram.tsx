"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type LotStep = "deposit" | "hold" | "settle" | "claim";

type Props = {
  step: LotStep;
  /** 0–1 overall autoplay progress */
  progress: number;
  /** Full loop length — keeps T+ in sync with the bars */
  cycleMs?: number;
  timer: string;
  vault: number;
  supply: number;
  /** One-line gloss under the PoR strip */
  pegHint?: string;
  /** Short example chip, e.g. "−100 USDC unwrap" */
  example?: string;
  labels: {
    fig: string;
    wallet: string;
    rail: string;
    settled: string;
    claim: string;
    retention: string;
    incident: string;
  };
  className?: string;
};

/** Bind-native vault-ring lot lifecycle (design D3) — no React Flow / Magic UI / RB. */
export function LotLifecycleDiagram({
  step,
  progress,
  cycleMs = 11_000,
  timer,
  vault,
  supply,
  pegHint,
  example,
  labels,
  className,
}: Props) {
  const ring = useMemo(() => ringMetrics(progress, step), [progress, step]);
  const peg = supply > 0.001 ? vault / supply : 1;
  const elapsed = formatElapsed(progress, cycleMs);

  const walletOn = step === "deposit";
  const railOn = step === "deposit" || step === "hold";
  const settleOn = step === "settle";
  const claimOn = step === "claim";
  const walletDone = step !== "deposit";
  const railDone = step === "settle" || step === "claim";

  // Beams track each beat so the orange line is always readable.
  const eWalletRail =
    step === "deposit" ? clamp01(progress / 0.25) : progress > 0.25 ? 1 : 0;
  const eRailRing =
    step === "hold"
      ? clamp01((progress - 0.25) / 0.25)
      : progress > 0.5
        ? 1
        : 0;
  const eToSettle =
    step === "settle"
      ? clamp01((progress - 0.5) / 0.25)
      : step === "claim"
        ? 1
        : 0;
  const eToClaim = step === "claim" ? clamp01((progress - 0.75) / 0.25) : 0;

  return (
    <div
      className={cn("relative flex min-h-0 flex-col", className)}
      role="img"
      aria-label={labels.fig}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
        {labels.fig}
      </p>

      <div className="relative mt-4 flex-1">
        <svg
          viewBox="0 0 480 400"
          className="mx-auto h-[min(48vh,380px)] w-full max-w-[440px]"
          aria-hidden
        >
          {/* Dim tracks */}
          <path
            d={PATHS.walletRail}
            fill="none"
            stroke="#3A3934"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <path
            d={PATHS.railRing}
            fill="none"
            stroke="#3A3934"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <path
            d={PATHS.ringSettle}
            fill="none"
            stroke="#3A3934"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <path
            d={PATHS.ringClaim}
            fill="none"
            stroke="#3A3934"
            strokeWidth={1.25}
            strokeLinecap="round"
          />

          {/* Lit beams + traveling head */}
          <BeamPath d={PATHS.walletRail} draw={eWalletRail} head={walletOn} />
          <BeamPath d={PATHS.railRing} draw={eRailRing} head={step === "hold"} />
          <BeamPath
            d={PATHS.ringSettle}
            draw={eToSettle}
            head={settleOn}
            mute={claimOn}
          />
          <BeamPath
            d={PATHS.ringClaim}
            draw={eToClaim}
            head={claimOn}
            alert
          />

          {/* Segmented vault ring */}
          <g transform="translate(240 190)">
            {Array.from({ length: 48 }, (_, i) => {
              const a0 = (i / 48) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 0.62) / 48) * Math.PI * 2 - Math.PI / 2;
              const lit = i / 48 < ring.fill;
              return (
                <path
                  key={i}
                  d={arcSeg(0, 0, 78, a0, a1)}
                  fill="none"
                  stroke={lit ? "#F5F4F0" : "#3A3934"}
                  strokeWidth={lit ? 5.5 : 4}
                  strokeLinecap="butt"
                  opacity={lit ? 1 : 0.55}
                />
              );
            })}
            {/* Orange hold sweep */}
            {ring.sweep > 0.01 ? (
              <path
                d={arcSeg(0, 0, 88, -Math.PI / 2, -Math.PI / 2 + ring.sweep * Math.PI * 2)}
                fill="none"
                stroke="#F54307"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : null}
            <text
              textAnchor="middle"
              y={-6}
              fill="#F5F4F0"
              fontSize={22}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="0.04em"
            >
              {timer}
            </text>
            <text
              textAnchor="middle"
              y={16}
              fill="#AFAFAC"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="0.12em"
            >
              {labels.retention.toUpperCase()}
            </text>
          </g>

          <LotNode
            x={72}
            y={56}
            label={labels.wallet}
            active={walletOn}
            done={walletDone}
          />
          <LotNode
            x={408}
            y={56}
            label={labels.rail}
            active={railOn && !railDone}
            done={railDone || (walletDone && step === "hold")}
          />
          <LotNode
            x={72}
            y={332}
            label={labels.settled}
            active={settleOn}
            done={false}
          />
          <LotNode
            x={408}
            y={332}
            label={labels.claim}
            active={claimOn}
            done={false}
            alert={claimOn}
          />

          {claimOn ? (
            <g transform="translate(408 292)">
              <rect
                x={-36}
                y={-10}
                width={72}
                height={18}
                rx={3}
                fill="#1a0f0c"
                stroke="#F12A02"
                strokeWidth={1}
              />
              <text
                textAnchor="middle"
                y={4}
                fill="#F12A02"
                fontSize={9}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="0.1em"
              >
                {labels.incident.toUpperCase()}
              </text>
            </g>
          ) : null}

          {/* Amount chips near active nodes */}
          {walletOn ? (
            <text
              x={72}
              y={90}
              textAnchor="middle"
              fill="#F54307"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              100.00 USDC
            </text>
          ) : null}
          {settleOn ? (
            <text
              x={72}
              y={358}
              textAnchor="middle"
              fill="#F54307"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              −100 USDC out
            </text>
          ) : null}
          {claimOn ? (
            <text
              x={408}
              y={358}
              textAnchor="middle"
              fill="#F12A02"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              +100 cover paid
            </text>
          ) : null}
        </svg>
      </div>

      <div className="mt-2 space-y-2 border-t border-[var(--color-line)] pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em]">
          <p className="text-[var(--color-accent2)]">
            Vault <span className="tabular-nums">{vault.toFixed(2)}</span>
            <span className="mx-1.5 text-[var(--color-muted)]">·</span>
            Supply <span className="tabular-nums">{supply.toFixed(2)}</span>
            <span className="mx-1.5 text-[var(--color-muted)]">·</span>
            Peg <span className="tabular-nums">{peg.toFixed(3)}</span>
          </p>
          <p className="text-[var(--color-muted)] tabular-nums">T+{elapsed}</p>
        </div>
        {pegHint ? (
          <p className="text-[12px] leading-snug text-[var(--color-muted)]">
            {pegHint}
            {example ? (
              <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.04em] text-[var(--color-accent2)]">
                {example}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const PATHS = {
  walletRail: "M 128 56 H 352",
  railRing: "M 408 78 Q 408 120 310 150",
  ringSettle: "M 170 250 Q 120 280 72 310",
  ringClaim: "M 310 250 Q 360 280 408 310",
};

function BeamPath({
  d,
  draw,
  mute,
  alert,
  head,
}: {
  d: string;
  draw: number;
  mute?: boolean;
  alert?: boolean;
  head?: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const amount = clamp01(draw);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el || amount <= 0.001) {
      setTip(null);
      return;
    }
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(len * amount);
    setTip({ x: pt.x, y: pt.y });
  }, [amount, d]);

  if (amount <= 0.001) return null;
  const offset = 1 - amount;
  const stroke = alert ? "#F12A02" : mute ? "#AFAFAC" : "#F54307";
  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={mute ? 1.5 : 2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={offset}
        opacity={mute ? 0.4 : 1}
      />
      {head && tip ? (
        <rect
          x={tip.x - 4}
          y={tip.y - 4}
          width={8}
          height={8}
          rx={1.5}
          fill={alert ? "#F12A02" : "#F54307"}
        />
      ) : null}
    </g>
  );
}

function LotNode({
  x,
  y,
  label,
  active,
  done,
  alert,
}: {
  x: number;
  y: number;
  label: string;
  active?: boolean;
  done?: boolean;
  alert?: boolean;
}) {
  const stroke = alert
    ? "#F12A02"
    : active
      ? "#F54307"
      : done
        ? "#AFAFAC"
        : "#3A3934";
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-56}
        y={-18}
        width={112}
        height={36}
        rx={10}
        ry={10}
        fill="#0E100D"
        stroke={stroke}
        strokeWidth={active || alert ? 1.5 : 1}
      />
      {active ? (
        <rect x={-48} y={-5} width={8} height={8} rx={1.5} fill="#F54307" />
      ) : done ? (
        <path
          d="M-46 -1 L-42 3 L-36 -4"
          fill="none"
          stroke="#F5F4F0"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle
          cx={-44}
          cy={0}
          r={4}
          fill="none"
          stroke="#3A3934"
          strokeWidth={1.25}
        />
      )}
      <text
        x={-28}
        y={4}
        fill="#F5F4F0"
        fontSize={11}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        letterSpacing="0.04em"
      >
        {label}
      </text>
    </g>
  );
}

function ringMetrics(progress: number, step: LotStep) {
  if (step === "deposit") {
    const local = clamp01(progress / 0.25);
    return { fill: 0.04 + local * 0.1, sweep: local * 0.12 };
  }
  if (step === "hold") {
    // Fill tracks the countdown: empty→full as 12h→0.
    const local = clamp01((progress - 0.25) / 0.25);
    return { fill: 0.12 + local * 0.88, sweep: local };
  }
  if (step === "settle") return { fill: 1, sweep: 0 };
  return { fill: 1, sweep: 0 };
}

function arcSeg(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function formatElapsed(progress: number, cycleMs: number) {
  const total = Math.floor((clamp01(progress) * cycleMs) / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
