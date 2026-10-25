import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function PolicyPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-8 px-5 pb-24 pt-4 md:px-10">
        <header>
          <p className="keel-meta">[ CL-001 ] · Claims policy · v0</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
            Claims policy
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Demo rules. Full text in{" "}
            <code className="text-[var(--color-accent2)]">
              docs/DISPUTE_POLICY.md
            </code>
            . Perilas and caps:{" "}
            <Link href="/cover" className="text-[var(--color-accent2)] underline">
              cover schedule
            </Link>
            .
          </p>
        </header>

        <Block title="Scope">
          Only <strong>unsettled</strong> Bind credit inside window{" "}
          <code>T</code>. Settled credit and free USDC are final under this
          policy.
        </Block>

        <Block title="Who can open">
          The original sender of the lot (<code>lot.from</code>). Partners may
          open on behalf of users via signed API in the partner phase.
        </Block>

        <Block title="Outcomes">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Approve</strong> — clawback / burn frozen lot; remint
              settled credit to claimant.
            </li>
            <li>
              <strong>Reject</strong> — unfreeze; settlement clock continues.
            </li>
          </ul>
        </Block>

        <Block title="Not covered">
          Settled / unwrapped funds, swaps off-rail, partner protocol exploits,
          oracles, liquidations, bad debt.
        </Block>

        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <Link href="/demo">Simulate a claim</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">Terms</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 border-t border-[var(--color-line)] pt-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)]">
        {title}
      </h2>
      <div className="text-[var(--color-muted)]">{children}</div>
    </section>
  );
}
