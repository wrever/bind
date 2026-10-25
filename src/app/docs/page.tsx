import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const LINKS = [
  {
    href: "/cover",
    title: "Cover schedule",
    body: "What Bind covers, caps, and exclusions.",
  },
  {
    href: "/policy",
    title: "Claims policy",
    body: "Who can claim, SLA targets, approve / reject.",
  },
  {
    href: "/terms",
    title: "Terms",
    body: "Demo ToS — recovery facility, not a bank.",
  },
  {
    href: "/integrate",
    title: "Integrate",
    body: "Safe Deposit + API for protocols and wallets.",
  },
  {
    href: "/por",
    title: "PoR",
    body: "Vault solvency readout.",
  },
  {
    href: "/api/v1/openapi",
    title: "OpenAPI",
    body: "Machine-readable partner surface.",
  },
];

export default function DocsPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-10 px-5 pb-24 pt-4 md:px-10">
        <header>
          <p className="keel-meta">[ DX-001 ] · Spec · Bind</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
            Documentation
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Bind is DeFi protocol insurance on Stellar: protocols contract Bind;
            users get Protected Deposit. Claims settle under the hood — see{" "}
            <code className="text-[var(--color-accent2)]">
              docs/PROTOCOL_INSURANCE.md
            </code>
            .
          </p>
        </header>

        <Section title="Start here">
          <div className="grid gap-3 sm:grid-cols-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)]"
              >
                <div className="font-[family-name:var(--font-display)] font-extrabold text-[var(--color-text)]">
                  {l.title}
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{l.body}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Asset model">
          <p>
            Deposit USDC → mint <strong>covered credit</strong> 1:1. Transfers
            (and Safe Deposits) create an <strong>unsettled</strong> lot with
            window <code>T</code>. After <code>T</code>, settle →{" "}
            <strong>settled</strong> → unwrap to USDC. Only unsettled lots are
            claimable.
          </p>
        </Section>

        <Section title="Invariants">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code>vault_USDC ≥ covered_supply</code>
            </li>
            <li>Unwrap only from settled balances</li>
            <li>
              Recover burns the frozen unsettled lot and remints settled credit
              to the claimant
            </li>
            <li>
              Caps: max lot, max unsettled supply, max claim, max open claims /
              account
            </li>
            <li>Issuer / arbiter keys are multisig in production</li>
          </ul>
        </Section>

        <Section title="Clawback & user safety">
          <p>
            Clawback is the <strong>ambulance</strong>, not the brand. It only
            touches Bind cover lots that are unsettled and under an open claim
            path (sender or ops role). Settled credit is final. Users opt in;
            Exit Pool lets them leave early for a fee. Partner exploits and
            liquidations are excluded — see Cover schedule.
          </p>
        </Section>

        <Section title="Exit Pool">
          <p>
            Sell unsettled cover for USDC immediately by paying bps. That fee
            prices clawback risk and is core usage revenue — Bind does not need
            a governance token to make money.
          </p>
        </Section>

        <Section title="Safe Deposit (protocols)">
          <p>
            For Blend-like markets: wrap → transfer into protocol custody as
            unsettled. The money market stays yours; Bind only covers the
            movement window. SDK: <code>safeDeposit</code>,{" "}
            <code>claimSafeDeposit</code>, <code>BindClient</code>.
          </p>
        </Section>

        <Section title="Engine surface">
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`deposit / transfer / settle / settle_all
unwrap / exitPool
openDisputeAsSender / freeze / resolve
safeDeposit / claimSafeDeposit
por()  // peg + caps readout`}
          </pre>
        </Section>

        <Section title="Repo docs">
          <ul className="space-y-2 text-sm">
            <li>
              <code>docs/VISION.md</code> — norte fijo
            </li>
            <li>
              <code>docs/BIND_BUSINESS.md</code> — modelo de negocio
            </li>
            <li>
              <code>docs/PITCH_FAQ.md</code> — 1 frase + defensa de objeciones
            </li>
            <li>
              <code>docs/COVER_SCHEDULE.md</code> / <code>TOS.md</code> /{" "}
              <code>DISPUTE_POLICY.md</code>
            </li>
            <li>
              <code>docs/MEMORIA.md</code> — qué está listo de verdad
            </li>
            <li>
              <code>docs/HACKATHON.md</code> · <code>EVIDENCE.md</code> ·{" "}
              <code>ARCHITECTURE.md</code>
            </li>
          </ul>
        </Section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/demo">Try the console</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/integrate">Partner integrate</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cover">Cover schedule</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-[var(--color-line)] pt-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[var(--color-text)]">
        {title}
      </h2>
      <div className="space-y-3 text-[var(--color-muted)]">{children}</div>
    </section>
  );
}
