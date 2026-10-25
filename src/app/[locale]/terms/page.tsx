import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PageCtaRow,
  PageHero,
  PageShell,
} from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  const points = [t("li1"), t("li2"), t("li3"), t("li4")];

  return (
    <PageShell>
      <PageHero meta={t("meta")} title={t("title")} body={t("body")} />

      <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {points.map((line, i) => (
          <li
            key={line}
            className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr] sm:items-start"
          >
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
              {line}
            </span>
          </li>
        ))}
      </ul>

      <PageCtaRow>
        <Button asChild>
          <Link href="/cover">{t("ctaCover")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/policy">{t("ctaPolicy")}</Link>
        </Button>
      </PageCtaRow>
    </PageShell>
  );
}
