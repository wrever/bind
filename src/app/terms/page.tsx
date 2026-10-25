import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-4 md:px-10">
        <p className="keel-meta">[ LG-001 ] · Terms · Demo</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
          Terms of use
        </h1>
        <p className="text-[var(--color-muted)]">
          Bind is an optional recovery / cover facility — not a bank and not
          licensed insurance unless separately authorized. Full text:{" "}
          <code className="text-[var(--color-accent2)]">docs/TOS.md</code>.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[var(--color-muted)]">
          <li>Cover only on unsettled lots inside window T.</li>
          <li>Clawback is the claims rail, not the product.</li>
          <li>Partner protocol exploits and liquidations are excluded.</li>
          <li>Liability limited to vault/pool under the Cover Schedule.</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <Link href="/cover">Cover schedule</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/policy">Claims policy</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
