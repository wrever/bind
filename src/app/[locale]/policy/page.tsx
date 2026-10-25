import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function PolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Policy");

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
            {t("intro")}{" "}
            <code className="text-[var(--color-accent2)]">
              docs/DISPUTE_POLICY.md
            </code>
            {t("introPerils")}{" "}
            <Link href="/cover" className="text-[var(--color-accent2)] underline">
              {t("coverLink")}
            </Link>
            .
          </p>
        </header>

        <Block title={t("scopeTitle")}>{t("scopeBody")}</Block>
        <Block title={t("whoTitle")}>{t("whoBody")}</Block>
        <Block title={t("outcomesTitle")}>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Approve</strong> — {t("approve")}
            </li>
            <li>
              <strong>Reject</strong> — {t("reject")}
            </li>
          </ul>
        </Block>
        <Block title={t("notTitle")}>{t("notBody")}</Block>

        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <Link href="/demo">{t("ctaDemo")}</Link>
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

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 border-t border-[var(--color-line)] pt-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)]">
        {title}
      </h2>
      <div className="text-[var(--color-muted)]">{children}</div>
    </section>
  );
}
