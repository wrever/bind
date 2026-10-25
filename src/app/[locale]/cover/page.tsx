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

export default async function CoverPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cover");

  const notCovered = [t("not1"), t("not2"), t("not3"), t("not4")];

  return (
    <PageShell>
      <PageHero meta={t("meta")} title={t("title")} body={t("body")} />

      <PageSection title={t("coveredTitle")} index="01">
        <p className="text-[var(--color-text)]">{t("coveredBody")}</p>
      </PageSection>

      <PageSection title={t("notTitle")} index="02">
        <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {notCovered.map((line) => (
            <li
              key={line}
              className="flex gap-4 py-4 text-[15px] leading-relaxed md:text-base"
            >
              <span
                className="mt-2 size-1.5 shrink-0 bg-[var(--color-accent)]"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={t("capsTitle")} index="03">
        <p>{t("capsMeta")}</p>
      </PageSection>

      <PageCtaRow>
        <Button asChild>
          <Link href="/integrate">{t("ctaIntegrate")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/terms">{t("ctaTerms")}</Link>
        </Button>
      </PageCtaRow>
    </PageShell>
  );
}
