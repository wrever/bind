import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LandingRail } from "@/components/landing-rail";
import { Button } from "@/components/ui/button";

const FLOW = [
  {
    id: "01",
    icon: ShieldCheck,
    title: "Your protocol contracts Bind",
    body: "Keep your money market. Buy cover in basis points and show Protected Deposit to users.",
  },
  {
    id: "02",
    icon: Timer,
    title: "Retention before free exit",
    body: "Without KYC, covered funds hold about 12 hours. Unwrap and swap stay blocked while unsettled.",
  },
  {
    id: "03",
    icon: Lock,
    title: "Claim while funds are on-rail",
    body: "In-window breach on the Bind rail can be indemnified. Off-rail drains need Tier 3 capital.",
  },
] as const;

const LANES = [
  {
    name: "Standard",
    badge: "No KYC · 12h",
    control: "Time hold + exit block",
    window: "12 hours",
    note: "Default cover for depositors without identity.",
  },
  {
    name: "Fast Lane",
    badge: "KYC · ~1h",
    control: "Partner attestation",
    window: "~1 hour",
    note: "Shorter retention when the partner attests KYC.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />

      <main className="relative">
        <section className="relative px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6">
              <p className="animate-keel-rise text-sm font-medium tracking-[0.04em] text-[var(--color-muted)]">
                DeFi protocol insurance on Stellar
              </p>
              <h1 className="animate-keel-rise-delay mt-6">
                <span className="sr-only">Bind</span>
                <BrandMark variant="hero" priority />
              </h1>
              <p className="animate-keel-rise-delay-2 mt-8 max-w-lg text-xl leading-relaxed text-[var(--color-text)] md:text-2xl md:leading-snug">
                Security cover protocols contract — so depositors get a
                retention window before free exit.
              </p>
              <p className="animate-keel-rise-delay-2 mt-4 max-w-md text-[var(--color-muted)]">
                Claims stay under the hood. You keep the money market; Bind is
                the insurance counterparty.
              </p>
              <div className="animate-keel-rise-delay-2 mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/integrate">
                    Talk to Bind
                    <ArrowRight
                      className="size-4"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/demo">See the demo</Link>
                </Button>
              </div>
            </div>

            <div className="animate-keel-rise-delay-2 lg:col-span-6">
              <LandingRail />
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
                How cover works
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                Three steps. Clawback is claims infrastructure — not the product
                you sell to users.
              </p>
            </div>

            <ol className="mt-12 grid gap-0 border border-[var(--color-line)] md:grid-cols-3">
              {FLOW.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.id}
                    className={`relative p-7 md:p-8 ${i < FLOW.length - 1 ? "border-b border-[var(--color-line)] md:border-b-0 md:border-r" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)]">
                        {step.id}
                      </span>
                      <Icon
                        className="size-5 text-[var(--color-accent)]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
                      {step.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
              Pay with time, or with KYC
            </h2>
            <p className="mt-4 max-w-xl text-[var(--color-muted)]">
              Retention is a documented protected hold — deferred finality, not
              a mystery lock.
            </p>

            <div className="mt-10 overflow-x-auto border border-[var(--color-line)]">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                      Lane
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                      Profile
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                      Control
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                      Window
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LANES.map((lane) => (
                    <tr
                      key={lane.name}
                      className="border-b border-[var(--color-line)] last:border-b-0"
                    >
                      <td className="px-5 py-5 font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
                        {lane.name}
                      </td>
                      <td className="px-5 py-5">
                        <span className="inline-flex border border-[var(--color-line)] bg-[var(--color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]">
                          {lane.badge}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-[var(--color-muted)]">
                        {lane.control}
                      </td>
                      <td className="px-5 py-5 text-sm tabular-nums text-[var(--color-text)]">
                        {lane.window}
                      </td>
                      <td className="px-5 py-5 text-sm text-[var(--color-muted)]">
                        {lane.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 bg-[var(--color-surface)] px-6 py-10 md:flex-row md:items-end md:justify-between md:px-12 md:py-14">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-4xl">
                Insurance your protocol can contract
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                Policy, claims desk, proof of reserves, and Safe Deposit — under
                your brand, on your market.
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
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
