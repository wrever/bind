import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingScrollDemo } from "@/components/landing-scroll-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { VoxelArc } from "@/components/voxel-arc";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const flow = [
    { n: "01", title: t("flow1Title"), body: t("flow1Body") },
    { n: "02", title: t("flow2Title"), body: t("flow2Body") },
    { n: "03", title: t("flow3Title"), body: t("flow3Body") },
  ];

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />

      <main>
        {/*
          One continuous stage: aurora fills this whole block,
          hero copy on top, Remotion demo sits on the sea (no gap).
        */}
        <section className="relative overflow-x-clip">
          {/*
            Sticky viewport aurora: horizon maps to the SCREEN.
            A tall absolute canvas (200vh+) pushed the sea below the fold.
          */}
          <div
            aria-hidden
            className="pointer-events-none sticky top-0 z-0 h-[100dvh] -mb-[100dvh]"
          >
            <VoxelArc
              className="absolute inset-0 h-full w-full min-h-0"
              color="#243038"
              accentColor="#7BA4B2"
              backgroundColor="#0E100D"
              density={1.2}
              voxelSize={0.7}
              roundness={0.08}
              horizon={0.18}
              curvature={0.68}
              waveHeight={1.3}
              waveLength={0.88}
              speed={0.34}
              turbulence={0.45}
              glow={1.5}
              haze={0.4}
              bloom={0.8}
              brightness={1.25}
              interactive={false}
            />
          </div>

          {/* Compact hero — sits on the sea */}
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-3 pt-12 text-center md:px-10 md:pb-4 md:pt-14">
            <p className="animate-keel-rise text-sm text-[var(--color-muted)]">
              {t("eyebrow")}
            </p>
            <h1 className="animate-keel-rise-delay mt-3 font-[family-name:var(--font-display)] text-[clamp(1.9rem,5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]">
              {t("headline")}
            </h1>
            <p className="animate-keel-rise-delay-2 mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-muted)] md:text-[15px]">
              {t("subhead")}
            </p>
            <div className="animate-keel-rise-delay-2 relative z-20 mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-black/40"
              >
                <Link href="/integrate">
                  {t("ctaTalk")}
                  <ArrowRight
                    className="size-4"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[var(--color-line)] bg-[var(--color-bg)]/55 backdrop-blur-sm"
              >
                <Link href="#quick-demo">{t("ctaDemo")}</Link>
              </Button>
            </div>
          </div>

          {/* Demo immediately under CTAs, mid-aurora */}
          <div className="relative z-10">
            <LandingScrollDemo />
          </div>
        </section>

        <section className="relative z-10 border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
                {t("flowTitle")}
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">{t("flowBody")}</p>
            </div>

            <ol className="mt-14 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {flow.map((step) => (
                <li
                  key={step.n}
                  className="grid gap-4 py-8 md:grid-cols-12 md:items-start md:gap-8"
                >
                  <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)] md:col-span-1">
                    {step.n}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:col-span-4 md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[var(--color-muted)] md:col-span-7 md:text-base">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
              {t("lanesTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-[var(--color-muted)]">
              {t("lanesBody")}
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <LaneCard
                name={t("standardName")}
                badge={t("standardBadge")}
                window={t("standardWindow")}
                fill="100%"
                body={t("standardBody")}
              />
              <LaneCard
                name={t("fastName")}
                badge={t("fastBadge")}
                window={t("fastWindow")}
                fill="18%"
                body={t("fastBody")}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl bg-[var(--color-surface)] px-6 py-12 md:px-12 md:py-16">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] md:text-[2.5rem] md:leading-tight">
                  {t("ctaTitle")}
                </h2>
                <p className="mt-4 text-[var(--color-muted)]">{t("ctaBody")}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/cover">
                    {t("ctaCover")}
                    <ArrowRight
                      className="size-4"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/docs">{t("ctaDocs")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LaneCard({
  name,
  badge,
  window,
  fill,
  body,
}: {
  name: string;
  badge: string;
  window: string;
  fill: string;
  body: string;
}) {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)]">
          {name}
        </h3>
        <span className="text-xs font-medium text-[var(--color-muted)]">
          {badge}
        </span>
      </div>
      <p className="mt-6 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
        {window}
      </p>
      <div className="mt-5 h-1.5 overflow-hidden bg-[var(--color-bg)]">
        <div
          className="h-full bg-[var(--color-accent)]"
          style={{ width: fill }}
        />
      </div>
      <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
        {body}
      </p>
    </div>
  );
}
