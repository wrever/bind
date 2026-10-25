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
      className="relative h-[300vh] bg-transparent"
      aria-label="Bind demo"
    >
      <div className="sticky top-[52px] flex h-[min(520px,calc(100dvh-56px))] w-full items-start justify-center px-4 pt-0 md:px-8">
        <Player
          ref={playerRef}
          component={BindDemo}
          inputProps={{ labels }}
          durationInFrames={BIND_DEMO_DURATION}
          compositionWidth={BIND_DEMO_WIDTH}
          compositionHeight={BIND_DEMO_HEIGHT}
          fps={BIND_DEMO_FPS}
          style={{
            width: "min(100%, 860px)",
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
