import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Docs");

  const links = [
    { href: "/cover" as const, title: t("linkCoverTitle"), body: t("linkCoverBody") },
    { href: "/policy" as const, title: t("linkPolicyTitle"), body: t("linkPolicyBody") },
    { href: "/terms" as const, title: t("linkTermsTitle"), body: t("linkTermsBody") },
    { href: "/integrate" as const, title: t("linkIntegrateTitle"), body: t("linkIntegrateBody") },
    { href: "/por" as const, title: t("linkPorTitle"), body: t("linkPorBody") },
  ];

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-10 px-5 pb-16 pt-4 md:px-10">
        <header>
          <p className="keel-meta">{t("meta")}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
            {t("title")}
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            {t("intro")}{" "}
            <code className="text-[var(--color-accent2)]">
              docs/PROTOCOL_INSURANCE.md
            </code>
            .
          </p>
        </header>

        <Section title={t("startHere")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((l) => (
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
            <a
              href="/api/v1/openapi"
              className="block border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)]"
            >
              <div className="font-[family-name:var(--font-display)] font-extrabold text-[var(--color-text)]">
                {t("linkOpenapiTitle")}
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {t("linkOpenapiBody")}
              </p>
            </a>
          </div>
        </Section>

        <Section title={t("assetTitle")}>
          <p>{t("assetBody")}</p>
        </Section>

        <Section title={t("invariantsTitle")}>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code>{t("inv1")}</code>
            </li>
            <li>{t("inv2")}</li>
            <li>{t("inv3")}</li>
            <li>{t("inv4")}</li>
            <li>{t("inv5")}</li>
          </ul>
        </Section>

        <Section title={t("clawbackTitle")}>
          <p>{t("clawbackBody")}</p>
        </Section>

        <Section title={t("exitTitle")}>
          <p>{t("exitBody")}</p>
        </Section>

        <Section title={t("safeTitle")}>
          <p>{t("safeBody")}</p>
        </Section>

        <Section title={t("engineTitle")}>
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`deposit / transfer / settle / settle_all
unwrap / exitPool
openDisputeAsSender / freeze / resolve
safeDeposit / claimSafeDeposit
por()  // peg + caps readout`}
          </pre>
        </Section>

        <Section title={t("repoTitle")}>
          <ul className="space-y-2 text-sm">
            <li>
              <code>docs/VISION.md</code> — {t("repoVision")}
            </li>
            <li>
              <code>docs/BIND_BUSINESS.md</code> — {t("repoBusiness")}
            </li>
            <li>
              <code>docs/PITCH_FAQ.md</code> — {t("repoPitch")}
            </li>
            <li>
              <code>docs/COVER_SCHEDULE.md</code> / <code>TOS.md</code> /{" "}
              <code>DISPUTE_POLICY.md</code>
            </li>
            <li>
              <code>docs/MEMORIA.md</code> — {t("repoMemoria")}
            </li>
            <li>
              <code>docs/HACKATHON.md</code> · <code>EVIDENCE.md</code> ·{" "}
              <code>ARCHITECTURE.md</code>
            </li>
          </ul>
        </Section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/demo">{t("ctaDemo")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/integrate">{t("ctaIntegrate")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cover">{t("ctaCover")}</Link>
          </Button>
        </div>
      </article>
      <SiteFooter />
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
