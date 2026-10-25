import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-6 px-5 pb-16 pt-4 md:px-10">
        <p className="keel-meta">{t("meta")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
          {t("title")}
        </h1>
        <p className="text-[var(--color-muted)]">
          {t("body")}{" "}
          <code className="text-[var(--color-accent2)]">docs/TOS.md</code>.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[var(--color-muted)]">
          <li>{t("li1")}</li>
          <li>{t("li2")}</li>
          <li>{t("li3")}</li>
          <li>{t("li4")}</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <Link href="/cover">{t("ctaCover")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/policy">{t("ctaPolicy")}</Link>
          </Button>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
