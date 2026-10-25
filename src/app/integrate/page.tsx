import Link from "next/link";
import { FreighterConnect } from "@/components/freighter-connect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntegratePage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-5 pb-16 pt-4 md:px-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="keel-meta">[ PT-002 ] · Partners</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
              Contract Bind for your protocol
            </h1>
            <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
              You are the money market. Bind is the insurance counterparty you
              buy: Protected Deposit for users, claims desk and PoR for you —
              not a checkout, not another lending pool.
            </p>
          </div>
          <FreighterConnect />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "You own UX",
              d: "Your brand, your KYC, your market. Bind is the cover rail underneath.",
            },
            {
              t: "We own claims",
              d: "Policy window, freeze/claim, clawback indemnity, Exit Pool, caps.",
            },
            {
              t: "Safe Deposit",
              d: "Wrap → transfer to protocol custody as unsettled. Blend-like deposits with a claim window.",
            },
          ].map((x) => (
            <Card key={x.t}>
              <CardHeader>
                <CardTitle className="text-base">{x.t}</CardTitle>
                <CardDescription>{x.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <section className="space-y-3 border-t border-[var(--color-line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            Safe Deposit (SDK)
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            <code>safeDeposit</code> / <code>claimSafeDeposit</code> in{" "}
            <code>@keel/sdk</code> (BindClient alias). Does not implement
            lending — only the cover movement.
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`import { BindClient, safeDeposit, claimSafeDeposit } from "@keel/sdk";

const client = BindClient.demo();
const { state, lotId } = safeDeposit(client.state, {
  user: "alice",
  protocol: "blend_pool",
  amount: 100,
});
// ... later, if phishing on deposit path:
claimSafeDeposit(state, "alice", "blend_pool", lotId);`}
          </pre>
        </section>

        <section className="space-y-3 border-t border-[var(--color-line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            Demo API
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            OpenAPI:{" "}
            <Link
              href="/api/v1/openapi"
              className="text-[var(--color-accent2)] underline"
            >
              /api/v1/openapi
            </Link>
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`curl -s -X POST http://127.0.0.1:3847/api/v1/sessions \\
  -H 'content-type: application/json' -d '{"windowMs":45000}'

curl -s -X POST http://127.0.0.1:3847/api/v1/sessions/$ID/actions \\
  -H 'content-type: application/json' \\
  -d '{"action":"deposit","address":"alice","amount":100}'`}
          </pre>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/cover">Cover schedule</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">Terms</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
