import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import { LandingRail } from "@/components/landing-rail";
import { Button } from "@/components/ui/button";

const FLOW = [
  {
    id: "01",
    icon: ShieldCheck,
    title: "Protocol buys Bind",
    body: "Money markets keep lending. They contract Bind — premium in bps — and show Protected Deposit.",
  },
  {
    id: "02",
    icon: Timer,
    title: "Retention window",
    body: "Without KYC, covered funds hold ~12h. Unwrap/swap blocked so attacks cannot cash out instantly.",
  },
  {
    id: "03",
    icon: Lock,
    title: "Indemnify in-window",
    body: "Breach while funds stay on the Bind rail → claim pays. Off-rail drains need Tier 3 capital.",
  },
] as const;

const LANES = [
  {
    id: "LN-01",
    name: "Standard",
    badge: "NO KYC · 12H",
    control: "Time + exit block",
    window: "12h hold",
    note: "Default cover for depositors without identity.",
  },
  {
    id: "LN-02",
    name: "Fast Lane",
    badge: "KYC · 1H",
    control: "Identity + recovery",
    window: "~1h hold",
    note: "Partner attestation unlocks shorter retention.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <div className="keel-grid absolute inset-0 pointer-events-none" />
      <SiteHeader />

      <main className="relative">
        {/* Hero — brand + one line + CTAs + product rail */}
        <section className="relative overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-20 md:pt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-line)]"
          />
          <div
            aria-hidden
            className="keel-stripe absolute bottom-0 left-0 right-0 h-10 opacity-90"
          />

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-6">
              <p className="animate-keel-rise keel-meta">
                [ SI-001 ] · DeFi protocol insurance · Stellar
              </p>
              <h1 className="animate-keel-rise-delay mt-5">
                <BrandMark variant="hero" priority />
              </h1>
              <div className="keel-rule mt-6 h-1 w-24 bg-[var(--color-accent)]" />
              <p className="animate-keel-rise-delay-2 mt-6 max-w-md text-lg text-[var(--color-muted)] md:text-xl">
                Security insurance protocols contract — retention before free
                exit, claims under the hood.
              </p>
              <div className="animate-keel-rise-delay-2 mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/demo">
                    Run the console
                    <ArrowRight
                      className="size-4"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/integrate">Integrate</Link>
                </Button>
              </div>
            </div>

            <div className="animate-keel-rise-delay-2 lg:col-span-6">
              <LandingRail />
            </div>
          </div>
        </section>

        {/* Flow — numbered rail, not card grid */}
        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="keel-meta">[ FL-001 ] · Cover flow</p>
                <h2 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
                  How cover binds
                </h2>
              </div>
              <p className="max-w-sm text-sm text-[var(--color-muted)]">
                One job per step. Clawback is claims ops — not the storefront.
              </p>
            </div>

            <ol className="mt-12 grid gap-0 border border-[var(--color-line)] md:grid-cols-3">
              {FLOW.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.id}
                    className={`relative p-6 ${i < FLOW.length - 1 ? "border-b border-[var(--color-line)] md:border-b-0 md:border-r" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="keel-meta tabular-nums">
                        {step.id} / module
                      </span>
                      <Icon
                        className="size-5 text-[var(--color-accent)]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[var(--color-muted)]">{step.body}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Lanes — retention vs KYC */}
        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="keel-meta">[ LN-000 ] · Retention lanes</p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
              Pay with time, or KYC
            </h2>
            <p className="mt-4 max-w-xl text-[var(--color-muted)]">
              Retention is deferred finality — documented as Protected hold, not
              a mystery lock.
            </p>

            <div className="mt-10 overflow-x-auto border border-[var(--color-line)]">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
                    <th className="keel-meta px-4 py-3 font-medium">Lane</th>
                    <th className="keel-meta px-4 py-3 font-medium">Badge</th>
                    <th className="keel-meta px-4 py-3 font-medium">Control</th>
                    <th className="keel-meta px-4 py-3 font-medium">Window</th>
                    <th className="keel-meta px-4 py-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {LANES.map((lane) => (
                    <tr
                      key={lane.id}
                      className="border-b border-[var(--color-line)] last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <span className="keel-meta block">{lane.id}</span>
                        <span className="mt-1 block font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
                          {lane.name}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex border border-[var(--color-line)] bg-[var(--color-bg)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] font-medium tracking-[0.08em] text-[var(--color-accent2)]">
                          {lane.badge}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                        {lane.control}
                      </td>
                      <td className="px-4 py-4 font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--color-text)]">
                        {lane.window}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                        {lane.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Partner CTA */}
        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:flex-row md:items-end md:justify-between md:p-10">
            <div className="max-w-2xl">
              <p className="keel-meta">[ PT-001 ] · Partners</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
                Insurance your protocol contracts
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                You keep the money market. Bind is the cover counterparty:
                policy, claims desk, PoR, Safe Deposit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/cover">
                  Cover schedule
                  <ArrowRight
                    className="size-4"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/terms">Terms</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--color-line)] px-5 py-8 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <BrandMark variant="footer" />
              <p className="keel-meta">
                BD-001 · Peg vault ≥ supply · Not a Blend clone
              </p>
            </div>
            <p className="keel-meta">
              <Link
                href="/docs"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                Docs
              </Link>
              {" · "}
              <Link
                href="/terms"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                Terms
              </Link>
              {" · "}
              <Link
                href="/policy"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                Claims
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
