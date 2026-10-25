import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function CoverPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cover");

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-8 px-5 pb-16 pt-4 md:px-10">
        <header>
          <p className="keel-meta">{t("meta")}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
            {t("title")}
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            {t("source")}{" "}
            <code className="text-[var(--color-accent2)]">
              docs/COVER_SCHEDULE.md
            </code>
          </p>
        </header>

        <section className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            {t("coveredTitle")}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">{t("coveredBody")}</p>
        </section>

        <section className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            {t("notTitle")}
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            <li>{t("not1")}</li>
            <li>{t("not2")}</li>
            <li>{t("not3")}</li>
            <li>{t("not4")}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            {t("capsTitle")}
          </h2>
          <p className="keel-meta">{t("capsMeta")}</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/integrate">{t("ctaIntegrate")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">{t("ctaTerms")}</Link>
          </Button>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
