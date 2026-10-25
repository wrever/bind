"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type StepId = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  { id: 0, label: "Deposit" },
  { id: 1, label: "Hold" },
  { id: 2, label: "Choose" },
  { id: 3, label: "Result" },
] as const;

export function LandingQuickDemo() {
  const [step, setStep] = useState<StepId>(0);
  const [outcome, setOutcome] = useState<"settle" | "claim" | null>(null);
  const [holdPct, setHoldPct] = useState(0);

  useEffect(() => {
    if (step !== 1) return;
    setHoldPct(0);
    const start = Date.now();
    const duration = 2800;
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setHoldPct(p);
      if (p >= 1) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [step]);

  function reset() {
    setStep(0);
    setOutcome(null);
    setHoldPct(0);
  }

  return (
    <section
      id="quick-demo"
      className="border-t border-[var(--color-line)] px-5 py-16 md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm text-[var(--color-muted)]">
            Interactive · ~30 seconds
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[var(--color-text)] md:text-3xl">
            Try Bind in four taps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)] md:text-base">
            A compressed walkthrough of Protected Deposit — deposit, hold, then
            settle or claim.
          </p>
        </div>

        {/* Progress */}
        <ol className="mt-10 flex items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const active = step === s.id || (step === 4 && s.id === 3);
            const done = step > s.id || (step === 4 && s.id <= 3);
            return (
              <li key={s.id} className="flex items-center gap-2 sm:gap-3">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className={`hidden h-px w-6 sm:block ${done ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]"}`}
                  />
                ) : null}
                <span
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm ${
                    active
                      ? "text-[var(--color-text)]"
                      : done
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-muted)]"
                  }`}
                >
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full border text-[11px] font-medium ${
                      done && !active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-black"
                        : active
                          ? "border-[var(--color-accent)] text-[var(--color-text)]"
                          : "border-[var(--color-line)]"
                    }`}
                  >
                    {done && !active ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : (
                      s.id + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </li>
            );
          })}
        </ol>

        {/* Panel */}
        <div className="mt-8 border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
          {step === 0 && (
            <StepBody
              kicker="Step 1 · Deposit"
              title="User wraps 100 USDC into Bind cover"
              body="Funds enter the Bind rail as covered credit. Your protocol still owns the money-market UX."
              status={[
                { k: "USDC in", v: "100" },
                { k: "Cover credit", v: "—" },
                { k: "Free exit", v: "n/a" },
              ]}
              action={
                <Button size="lg" onClick={() => setStep(1)}>
                  Deposit 100 USDC
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Button>
              }
            />
          )}

          {step === 1 && (
            <StepBody
              kicker="Step 2 · Hold"
              title="Retention window is open"
              body="In production this is ~12h without KYC (or ~1h with Fast Lane). Here it compresses so you can feel the block."
              status={[
                { k: "Cover credit", v: "100" },
                { k: "Window", v: `${Math.round(holdPct * 100)}%` },
                {
                  k: "Free exit",
                  v: "Blocked",
                  tone: "accent" as const,
                },
              ]}
              extra={
                <div className="mt-5">
                  <div className="h-1.5 overflow-hidden bg-[var(--color-bg)]">
                    <div
                      className="h-full bg-[var(--color-accent)] transition-[width] duration-100 ease-linear"
                      style={{ width: `${holdPct * 100}%` }}
                    />
                  </div>
                </div>
              }
              action={
                <Button
                  size="lg"
                  disabled={holdPct < 0.35}
                  onClick={() => setStep(2)}
                >
                  {holdPct < 0.35 ? "Holding…" : "Continue"}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Button>
              }
            />
          )}

          {step === 2 && (
            <StepBody
              kicker="Step 3 · Choose"
              title="Still inside the window — what happened?"
              body="No breach → wait to settle and unwrap 1:1. Breach on-rail → open a claim while funds cannot free-exit."
              status={[
                { k: "Cover credit", v: "100" },
                { k: "Status", v: "Unsettled" },
                { k: "Free exit", v: "Blocked", tone: "accent" },
              ]}
              action={
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setOutcome("settle");
                      setStep(3);
                    }}
                  >
                    Settle · free exit
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setOutcome("claim");
                      setStep(3);
                    }}
                  >
                    Claim · breach
                  </Button>
                </div>
              }
            />
          )}

          {step === 3 && outcome === "settle" && (
            <StepBody
              kicker="Step 4 · Settled"
              title="Window closed — unwrap 1:1"
              body="Credit settles. User can unwrap to USDC. No claim needed. Peg stays vault ≥ supply."
              status={[
                { k: "USDC out", v: "100" },
                { k: "Claim", v: "None" },
                { k: "Peg", v: "OK" },
              ]}
              action={
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="outline" onClick={reset}>
                    Run again
                  </Button>
                  <Button asChild size="lg" className="flex-1">
                    <Link href="/demo">
                      Open full console
                      <ArrowRight className="size-4" strokeWidth={1.5} />
                    </Link>
                  </Button>
                </div>
              }
            />
          )}

          {step === 3 && outcome === "claim" && (
            <StepBody
              kicker="Step 4 · Claim"
              title="Breach in window — Bind indemnifies"
              body="Lot freezes. Claims desk reviews. Approved claim remints settled cover to the rightful party. Clawback is ops under the hood — not the product pitch."
              status={[
                { k: "Lot", v: "Frozen" },
                { k: "Claim", v: "Open" },
                { k: "Free exit", v: "Blocked", tone: "accent" },
              ]}
              action={
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="outline" onClick={reset}>
                    Run again
                  </Button>
                  <Button asChild size="lg" className="flex-1">
                    <Link href="/ops">
                      See claims ops
                      <ArrowRight className="size-4" strokeWidth={1.5} />
                    </Link>
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

function StepBody({
  kicker,
  title,
  body,
  status,
  action,
  extra,
}: {
  kicker: string;
  title: string;
  body: string;
  status: { k: string; v: string; tone?: "accent" }[];
  action: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">
        {kicker}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] md:text-[15px]">
        {body}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-3 border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
        {status.map((s) => (
          <div key={s.k}>
            <dt className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)]">
              {s.k}
            </dt>
            <dd
              className={`mt-1 text-sm font-semibold tabular-nums ${
                s.tone === "accent"
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text)]"
              }`}
            >
              {s.v}
            </dd>
          </div>
        ))}
      </dl>

      {extra}

      <div className="mt-8">{action}</div>
    </div>
  );
}
