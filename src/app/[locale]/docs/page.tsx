import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CodePanel,
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
  ];

  const invariants = [
    t("inv1"),
    t("inv2"),
    t("inv3"),
    t("inv4"),
    t("inv5"),
  ];

  return (
    <PageShell width="wide">
      <PageHero
        meta={t("meta")}
        title={t("title")}
        body={
          <>
            {t("intro")}{" "}
            <code className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--color-accent2)]">
              docs/PROTOCOL_INSURANCE.md
            </code>
            .
          </>
        }
      />

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
              <span className="text-[var(--color-text)]">
                {i === 0 ? (
                  <code className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--color-accent2)]">
                    {line}
                  </code>
                ) : (
                  line
                )}
              </span>
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

      <PageSection title={t("engineTitle")} index="07">
        <CodePanel>
          {`deposit / transfer / settle / settle_all
unwrap / exitPool
openDisputeAsSender / freeze / resolve
safeDeposit / claimSafeDeposit
por()  // peg + caps readout`}
        </CodePanel>
      </PageSection>

      <PageSection title={t("repoTitle")} index="08">
        <ul className="space-y-3 font-[family-name:var(--font-mono)] text-[13px]">
          <li>
            <span className="text-[var(--color-accent2)]">docs/VISION.md</span>
            <span className="text-[var(--color-muted)]"> — {t("repoVision")}</span>
          </li>
          <li>
            <span className="text-[var(--color-accent2)]">docs/BIND_BUSINESS.md</span>
            <span className="text-[var(--color-muted)]"> — {t("repoBusiness")}</span>
          </li>
          <li>
            <span className="text-[var(--color-accent2)]">docs/PITCH_FAQ.md</span>
            <span className="text-[var(--color-muted)]"> — {t("repoPitch")}</span>
          </li>
          <li className="text-[var(--color-muted)]">
            docs/COVER_SCHEDULE.md · TOS.md · DISPUTE_POLICY.md
          </li>
          <li>
            <span className="text-[var(--color-accent2)]">docs/MEMORIA.md</span>
            <span className="text-[var(--color-muted)]"> — {t("repoMemoria")}</span>
          </li>
          <li className="text-[var(--color-muted)]">
            docs/HACKATHON.md · EVIDENCE.md · ARCHITECTURE.md
          </li>
        </ul>
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
