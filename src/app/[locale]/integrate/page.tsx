import { getTranslations, setRequestLocale } from "next-intl/server";
import { FreighterConnect } from "@/components/freighter-connect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function IntegratePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Integrate");

  const cards = [
    { title: t("card1Title"), body: t("card1Body") },
    { title: t("card2Title"), body: t("card2Body") },
    { title: t("card3Title"), body: t("card3Body") },
  ];

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-5 pb-16 pt-4 md:px-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="keel-meta">{t("meta")}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
              {t("body")}
            </p>
          </div>
          <FreighterConnect />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((x) => (
            <Card key={x.title}>
              <CardHeader>
                <CardTitle className="text-base">{x.title}</CardTitle>
                <CardDescription>{x.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <section className="space-y-3 border-t border-[var(--color-line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            {t("sdkTitle")}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">{t("sdkBody")}</p>
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`import { BindClient, safeDeposit, claimSafeDeposit } from "@keel/sdk";

const client = BindClient.demo();
const { state, lotId } = safeDeposit(client.state, {
  user: "alice",
  protocol: "blend_pool",
  amount: 100,
});
// ... later, if phishing on deposit path:
claimSafeDeposit(state, "alice", "blend_pool", lotId);`}
          </pre>
        </section>

        <section className="space-y-3 border-t border-[var(--color-line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            {t("apiTitle")}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            {t("apiOpenapi")}{" "}
            <a
              href="/api/v1/openapi"
              className="text-[var(--color-accent2)] underline"
            >
              /api/v1/openapi
            </a>
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-xs text-[var(--color-accent2)]">
{`curl -s -X POST http://127.0.0.1:3847/api/v1/sessions \\
  -H 'content-type: application/json' -d '{"windowMs":45000}'

curl -s -X POST http://127.0.0.1:3847/api/v1/sessions/$ID/actions \\
  -H 'content-type: application/json' \\
  -d '{"action":"deposit","address":"alice","amount":100}'`}
          </pre>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/cover">{t("ctaCover")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">{t("ctaTerms")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">{t("ctaDocs")}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
