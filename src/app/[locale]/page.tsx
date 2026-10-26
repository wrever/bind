import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CoverScrollDemo } from "@/components/cover-scroll-demo";
import { FadeChip } from "@/components/motion/fade-chip";
import { SplitRise } from "@/components/motion/split-rise";
import { StatusMark } from "@/components/motion/status-mark";
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
          React Bits Voxel Arc pattern: real 100dvh sticky plane + content
          pulled over it. Sea fills the parent — never a short mid strip.
        */}
        <section className="relative">
          <div className="sticky top-0 z-0 h-[100dvh] w-full">
            <VoxelArc
              className="h-full w-full"
              color="#2A3A42"
              accentColor="#8BB8C4"
              backgroundColor="#0E100D"
              density={1.15}
              voxelSize={0.58}
              roundness={0.12}
              tilt={1}
              /* Default RB-ish crest — sea occupies the lower half+ of the screen */
              horizon={0.48}
              curvature={0.55}
              waveHeight={1}
              waveLength={1}
              speed={0.42}
              turbulence={0.38}
              glow={0.55}
              haze={0.7}
              bloom={0.28}
              brightness={1}
              interactive={false}
              intro
            />
          </div>

          <div className="relative z-10 -mt-[100dvh]">
            <div className="mx-auto flex min-h-[58dvh] max-w-3xl flex-col items-center justify-center px-4 pb-4 pt-10 text-center sm:px-5 sm:pt-12 md:px-10 md:pt-14">
              <p className="animate-keel-rise text-xs tracking-wide text-[var(--color-muted)] sm:text-sm">
                {t("eyebrow")}
              </p>
              <SplitRise
                text={t("headline")}
                as="h1"
                className="animate-keel-rise-delay mt-5 text-center font-[family-name:var(--font-display)] text-[clamp(1.85rem,6.2vw,3.35rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--color-text)] sm:mt-6"
              />
              <p className="animate-keel-rise-delay-2 mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-muted)] sm:mt-6 sm:text-[15px] md:text-base md:leading-relaxed">
                {t("subhead")}
              </p>
              <div className="animate-keel-rise-delay-2 mt-7 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:mt-8 sm:max-w-none sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-black/40 sm:w-auto"
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
                  className="w-full border-[var(--color-line)] bg-[var(--color-bg)]/85 backdrop-blur-md sm:w-auto"
                >
                  <Link href="#quick-demo">{t("ctaDemo")}</Link>
                </Button>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <CoverScrollDemo />
            </div>

            <div
              aria-hidden
              className="pointer-events-none h-[36vh] bg-gradient-to-b from-transparent via-[var(--color-bg)]/70 to-[var(--color-bg)]"
            />
            <div aria-hidden className="h-10 bg-[var(--color-bg)]" />
          </div>
        </section>

        <section className="relative z-10 -mt-px border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-16 sm:py-20 md:px-10 md:py-24">
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
                  <span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)] md:col-span-1">
                    <StatusMark status="done" size={12} />
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
        <FadeChip>{badge}</FadeChip>
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
