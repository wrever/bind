import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingQuickDemo } from "@/components/landing-quick-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { VoxelArc } from "@/components/voxel-arc";

const FLOW = [
  {
    n: "01",
    title: "Protocol contracts Bind",
    body: "Buy cover in basis points. Keep your money market and show Protected Deposit under your brand.",
  },
  {
    n: "02",
    title: "Retention before free exit",
    body: "Covered deposits sit in a timed window. Unwrap and swap stay blocked while unsettled.",
  },
  {
    n: "03",
    title: "Claim while funds are on-rail",
    body: "If a breach hits inside the window, Bind pays approved claims. Off-rail drains need Tier 3 capital.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden">
          <VoxelArc
            className="min-h-[78vh] md:min-h-[86vh]"
            color="#2A2824"
            accentColor="#F54307"
            backgroundColor="#0E100D"
            density={1.12}
            voxelSize={0.62}
            roundness={0.1}
            horizon={0.52}
            curvature={0.72}
            waveHeight={1.15}
            waveLength={0.9}
            speed={0.38}
            turbulence={0.42}
            glow={1.25}
            haze={0.85}
            bloom={0.65}
            interactive
          >
            <div className="mx-auto flex min-h-[78vh] max-w-3xl flex-col items-center justify-center px-5 pb-28 pt-16 text-center md:min-h-[86vh] md:px-10 md:pb-36 md:pt-20">
              <p className="animate-keel-rise text-sm text-[var(--color-muted)]">
                Bind · Security insurance for DeFi on Stellar
              </p>
              <h1 className="animate-keel-rise-delay mt-5 font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]">
                Insurance protocols can contract.
              </h1>
              <p className="animate-keel-rise-delay-2 mt-6 max-w-xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
                Bind holds covered deposits in a timed retention window before
                free exit — and pays claims if a breach hits while funds stay on
                the Bind rail.
              </p>
              <div className="animate-keel-rise-delay-2 mt-10 flex flex-wrap items-center justify-center gap-3">
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
                  <Link href="#quick-demo">See the demo</Link>
                </Button>
              </div>
            </div>
          </VoxelArc>
        </section>

        <LandingQuickDemo />

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
                Cover your protocol buys — not an app users download.
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                Bind sits underneath as the insurance counterparty. You keep the
                product surface; we own policy, retention, and claims.
              </p>
            </div>

            <ol className="mt-14 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {FLOW.map((step) => (
                <li
                  key={step.n}
                  className="grid gap-4 py-8 md:grid-cols-12 md:items-start md:gap-8"
                >
                  <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)] md:col-span-1">
                    {step.n}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:col-span-4 md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[var(--color-muted)] md:col-span-7 md:text-base">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
              Pay with time, or with KYC.
            </h2>
            <p className="mt-4 max-w-xl text-[var(--color-muted)]">
              Retention is deferred finality — a documented protected hold, not
              a mystery lock.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <LaneCard
                name="Standard"
                badge="No KYC"
                window="12h"
                fill="100%"
                body="Default for every depositor. Longer hold without identity."
              />
              <LaneCard
                name="Fast Lane"
                badge="KYC"
                window="~1h"
                fill="18%"
                body="Partner-vetted KYC shortens the window and improves attacker attribution."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl bg-[var(--color-surface)] px-6 py-12 md:px-12 md:py-16">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
                  Insurance your protocol can contract.
                </h2>
                <p className="mt-4 text-[var(--color-muted)]">
                  Cover schedule in basis points, a written claims policy, and
                  public proof of reserves — integration in days, not a rebuild.
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LaneCard({
  name,
  badge,
  window,
  fill,
  body,
}: {
  name: string;
  badge: string;
  window: string;
  fill: string;
  body: string;
}) {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)]">
          {name}
        </h3>
        <span className="text-xs font-medium text-[var(--color-muted)]">
          {badge}
        </span>
      </div>
      <p className="mt-6 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
        {window}
      </p>
      <div className="mt-5 h-1.5 overflow-hidden bg-[var(--color-bg)]">
        <div
          className="h-full bg-[var(--color-accent)]"
          style={{ width: fill }}
        />
      </div>
      <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
        {body}
      </p>
    </div>
  );
}
