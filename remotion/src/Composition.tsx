import React from "react";
import { AbsoluteFill, Composition } from "remotion";

/**
 * Studio placeholder — full scroll demo lives in the Next app
 * (`src/remotion/bind-demo.tsx` + LandingScrollDemo).
 */
export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="BindDemo"
        component={StudioBindDemo}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};

const StudioBindDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0E100D",
        color: "#F4F1EA",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
        fontSize: 28,
        fontWeight: 700,
      }}
    >
      Bind scroll demo → open the Next app landing
    </AbsoluteFill>
  );
};
