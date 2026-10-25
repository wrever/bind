import { getTranslations, setRequestLocale } from "next-intl/server";
import { DualTrackNote } from "@/components/chain-status";
import { FreighterConnect } from "@/components/freighter-connect";
import {
  CodePanel,
  PageCtaRow,
  PageHero,
  PageSection,
  PageShell,
} from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function IntegratePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Integrate");

  const pillars = [
    { n: "01", title: t("card1Title"), body: t("card1Body") },
    { n: "02", title: t("card2Title"), body: t("card2Body") },
    { n: "03", title: t("card3Title"), body: t("card3Body") },
  ];

  return (
    <PageShell width="wide">
      <PageHero
        meta={t("meta")}
        title={t("title")}
        body={t("body")}
        aside={<FreighterConnect />}
      />

      <DualTrackNote />

      <ol className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {pillars.map((p) => (
          <li
            key={p.n}
            className="grid gap-3 py-8 md:grid-cols-12 md:items-start md:gap-8"
          >
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)] md:col-span-1">
              {p.n}
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:col-span-4 md:text-2xl">
              {p.title}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--color-muted)] md:col-span-7 md:text-base">
              {p.body}
            </p>
          </li>
        ))}
      </ol>

      <PageSection title={t("sdkTitle")} index="04">
        <p>{t("sdkBody")}</p>
        <CodePanel>
          {`import { BindClient, safeDeposit, claimSafeDeposit } from "@keel/sdk";

const client = BindClient.demo();
const { state, lotId } = safeDeposit(client.state, {
  user: "alice",
  protocol: "blend_pool",
  amount: 100,
});
// ... later, if phishing on deposit path:
claimSafeDeposit(state, "alice", "blend_pool", lotId);`}
        </CodePanel>
      </PageSection>

      <PageSection title={t("apiTitle")} index="05">
        <p>
          {t("apiOpenapi")}{" "}
          <a
            href="/api/v1/openapi"
            className="text-[var(--color-accent2)] underline decoration-[var(--color-accent2)]/40 underline-offset-4 transition-colors hover:decoration-[var(--color-accent2)]"
          >
            /api/v1/openapi
          </a>
        </p>
        <CodePanel>
          {`curl -s -X POST http://127.0.0.1:3847/api/v1/sessions \\
  -H 'content-type: application/json' -d '{"windowMs":45000}'

curl -s -X POST http://127.0.0.1:3847/api/v1/sessions/$ID/actions \\
  -H 'content-type: application/json' \\
  -d '{"action":"deposit","address":"alice","amount":100}'`}
        </CodePanel>
      </PageSection>

      <PageCtaRow>
        <Button asChild>
          <Link href="/live">{t("ctaLive")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cover">{t("ctaCover")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/terms">{t("ctaTerms")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs">{t("ctaDocs")}</Link>
        </Button>
      </PageCtaRow>
    </PageShell>
  );
}
