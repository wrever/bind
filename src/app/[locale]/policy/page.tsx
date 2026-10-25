import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PageCtaRow,
  PageHero,
  PageSection,
  PageShell,
} from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function PolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Policy");

  return (
    <PageShell>
      <PageHero
        meta={t("meta")}
        title={t("title")}
        body={
          <>
            {t("intro")}{" "}
            <code className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--color-accent2)]">
              docs/DISPUTE_POLICY.md
            </code>
            {t("introPerils")}{" "}
            <Link
              href="/cover"
              className="text-[var(--color-accent2)] underline decoration-[var(--color-accent2)]/40 underline-offset-4"
            >
              {t("coverLink")}
            </Link>
            .
          </>
        }
      />

      <PageSection title={t("scopeTitle")} index="01">
        <p>{t("scopeBody")}</p>
      </PageSection>

      <PageSection title={t("whoTitle")} index="02">
        <p>{t("whoBody")}</p>
      </PageSection>

      <PageSection title={t("outcomesTitle")} index="03">
        <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          <li className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
            <span className="font-[family-name:var(--font-display)] font-extrabold text-[var(--color-text)]">
              Approve
            </span>
            <span>{t("approve")}</span>
          </li>
          <li className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
            <span className="font-[family-name:var(--font-display)] font-extrabold text-[var(--color-text)]">
              Reject
            </span>
            <span>{t("reject")}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection title={t("notTitle")} index="04">
        <p>{t("notBody")}</p>
      </PageSection>

      <PageCtaRow>
        <Button asChild>
          <Link href="/demo">{t("ctaDemo")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/terms">{t("ctaTerms")}</Link>
        </Button>
      </PageCtaRow>
    </PageShell>
  );
}
