"use client";

import { useEffect, useMemo, useRef } from "react";
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
 * Scroll-scrubbed Remotion story — sits on the hero aurora (no black gap).
 * Sticky height is viewport-aware so mobile doesn't crush the card.
 */
export function LandingScrollDemo() {
  const t = useTranslations("QuickDemo");
  const trackRef = useRef<HTMLElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const lastFrame = useRef(-1);

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
      className="relative h-[220vh] bg-transparent sm:h-[260vh] md:h-[300vh]"
      aria-label="Bind demo"
    >
      {/*
        Sticky band sized to remaining viewport under the header.
        Player uses width + max-height so 16:9 never overflows short phones.
      */}
      <div className="sticky top-[56px] flex h-[min(360px,calc(100dvh-8rem))] w-full items-start justify-center px-3 pt-2 sm:top-[60px] sm:h-[min(440px,calc(100dvh-7rem))] sm:px-4 sm:pt-1 md:h-[min(500px,calc(100dvh-5.5rem))] md:px-8 md:pt-0">
        <Player
          ref={playerRef}
          component={BindDemo}
          inputProps={{ labels }}
          durationInFrames={BIND_DEMO_DURATION}
          compositionWidth={BIND_DEMO_WIDTH}
          compositionHeight={BIND_DEMO_HEIGHT}
          fps={BIND_DEMO_FPS}
          className="overflow-hidden rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{
            width: "min(100%, 860px)",
            maxHeight: "100%",
            aspectRatio: `${BIND_DEMO_WIDTH} / ${BIND_DEMO_HEIGHT}`,
            background: "transparent",
          }}
          controls={false}
          loop={false}
          autoPlay={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          acknowledgeRemotionLicense
        />
      </div>
    </section>
  );
}
