"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { useTranslations } from "next-intl";
import {
  BIND_DEMO_DURATION,
  BIND_DEMO_FPS,
  BIND_DEMO_HEIGHT,
  BIND_DEMO_WIDTH,
  BindDemo,
  type BindDemoLabels,
} from "@/remotion/bind-demo";

/**
 * Scroll-scrubbed Remotion story.
 * Sticky band = remaining viewport under the header; Player scales to fill
 * that band (width + height) while keeping the composition aspect ratio.
 */
export function LandingScrollDemo() {
  const t = useTranslations("QuickDemo");
  const trackRef = useRef<HTMLElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const lastFrame = useRef(-1);
  // Remotion Player touches window — mount after hydration
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const labels: BindDemoLabels = useMemo(
    () => ({
      depositKicker: t("s1Kicker"),
      depositTitle: t("s1Title"),
      depositBody: t("s1Body"),
      holdKicker: t("s2Kicker"),
      holdTitle: t("s2Title"),
      holdBody: t("s2Body"),
      chooseKicker: t("s3Kicker"),
      chooseTitle: t("s3Title"),
      chooseBody: t("s3Body"),
      settleTitle: t("s4SettleTitle"),
      settleBody: t("s4SettleBody"),
      claimTitle: t("s4ClaimTitle"),
      claimBody: t("s4ClaimBody"),
      usdcIn: t("s1UsdcIn"),
      cover: t("s1Cover"),
      freeExit: t("s2Exit"),
      blocked: t("s2Blocked"),
      window: t("s2Window"),
      settled: t("s4SettleKicker"),
      claim: t("s4Claim"),
    }),
    [t],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!track) return;
        const rect = track.getBoundingClientRect();
        const total = Math.max(1, track.offsetHeight - window.innerHeight);
        const scrolled = Math.min(total, Math.max(0, -rect.top));
        const frame = Math.round(
          (scrolled / total) * (BIND_DEMO_DURATION - 1),
        );
        if (frame === lastFrame.current) return;
        lastFrame.current = frame;
        playerRef.current?.seekTo(frame);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="quick-demo"
      ref={trackRef}
      className="relative h-[240vh] bg-transparent sm:h-[280vh] md:h-[320vh]"
      aria-label="Bind demo"
    >
      {/* Solid Bind bg resumes under the card so scrub stays clean */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[22%] bottom-0 z-0 bg-[var(--color-bg)]"
      />
      <div className="sticky top-[60px] z-10 flex h-[calc(100dvh-60px)] w-full items-center justify-center px-3 py-3 sm:px-5 sm:py-4 md:px-8">
        {/*
          Fit sticky band: width capped by 1120 / parent / height budget × aspect.
          Remotion Player then paints absolute fill inside.
        */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: `${BIND_DEMO_WIDTH} / ${BIND_DEMO_HEIGHT}`,
            width:
              "min(100%, 1120px, calc((100dvh - 60px - 1.5rem) * 1280 / 900))",
            maxHeight: "calc(100dvh - 60px - 1.5rem)",
          }}
        >
          {ready ? (
            <Player
              ref={playerRef}
              component={BindDemo}
              inputProps={{ labels }}
              durationInFrames={BIND_DEMO_DURATION}
              compositionWidth={BIND_DEMO_WIDTH}
              compositionHeight={BIND_DEMO_HEIGHT}
              fps={BIND_DEMO_FPS}
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
              }}
              controls={false}
              loop={false}
              autoPlay={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              acknowledgeRemotionLicense
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 border border-[var(--color-line)] bg-[var(--color-bg)]/80"
            />
          )}
        </div>
      </div>
    </section>
  );
}
