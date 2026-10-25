import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  DocLink,
  PageCtaRow,
  PageHero,
  PageSection,
  PageShell,
} from "@/components/page-shell";
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
    { href: "/live" as const, title: t("linkLiveTitle"), body: t("linkLiveBody") },
  ];

  const invariants = [t("inv1"), t("inv2"), t("inv3"), t("inv4"), t("inv5")];

  return (
    <PageShell width="wide">
      <PageHero meta={t("meta")} title={t("title")} body={t("intro")} />

      <PageSection title={t("startHere")} index="01">
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <DocLink
              key={l.href}
              href={l.href}
              title={l.title}
              body={l.body}
            />
          ))}
          <DocLink
            href="/api/v1/openapi"
            title={t("linkOpenapiTitle")}
            body={t("linkOpenapiBody")}
            external
          />
        </div>
      </PageSection>

      <PageSection title={t("assetTitle")} index="02">
        <p>{t("assetBody")}</p>
      </PageSection>

      <PageSection title={t("invariantsTitle")} index="03">
        <ol className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {invariants.map((line, i) => (
            <li
              key={line}
              className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:items-start"
            >
              <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[var(--color-text)]">{line}</span>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection title={t("clawbackTitle")} index="04">
        <p>{t("clawbackBody")}</p>
      </PageSection>

      <PageSection title={t("exitTitle")} index="05">
        <p>{t("exitBody")}</p>
      </PageSection>

      <PageSection title={t("safeTitle")} index="06">
        <p>{t("safeBody")}</p>
      </PageSection>

      <PageCtaRow>
        <Button asChild>
          <Link href="/demo">{t("ctaDemo")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/integrate">{t("ctaIntegrate")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cover">{t("ctaCover")}</Link>
        </Button>
      </PageCtaRow>
    </PageShell>
  );
}
