import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function CoverPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-8 px-5 pb-16 pt-4 md:px-10">
        <header>
          <p className="keel-meta">[ CV-001 ] · Cover schedule · v0</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
            What Bind covers
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Source of truth:{" "}
            <code className="text-[var(--color-accent2)]">
              docs/COVER_SCHEDULE.md
            </code>
          </p>
        </header>

        <section className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Covered
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Unauthorized movement of <strong>unsettled</strong> Bind credit
            (theft key / phishing / fat-finger) inside window T, subject to
            caps and claims policy.
          </p>
        </section>

        <section className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Not covered
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            <li>Partner protocol exploits, oracles, bad debt</li>
            <li>Legitimate liquidations</li>
            <li>Settled credit, unwrapped USDC, swapped value</li>
            <li>Fraudulent claims</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Caps (demo defaults)
          </h2>
          <p className="keel-meta">
            max lot 10,000 · max claim 10,000 · max open claims / account 3 ·
            max unsettled supply 500,000
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/integrate">Integrate Safe Deposit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">Terms</Link>
          </Button>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
