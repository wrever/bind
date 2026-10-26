import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import {
  BIND_DEMO_DURATION,
  BIND_DEMO_FPS,
  BIND_DEMO_HEIGHT,
  BIND_DEMO_WIDTH,
  BindDemo,
  type BindDemoLabels,
} from "./bind-demo";

const BG = "#0E100D";
const TEXT = "#F4F1EA";
const MUTED = "#A8ABA2";
const ACCENT = "#F54307";

const EN_LABELS: BindDemoLabels = {
  depositKicker: "Step 1 · Deposit",
  depositTitle: "User wraps 100 USDC into Bind cover",
  depositBody:
    "Funds enter the Bind rail as covered credit. Your protocol still owns the money-market UX.",
  holdKicker: "Step 2 · Hold",
  holdTitle: "Retention window is open",
  holdBody:
    "In production this is ~12h without KYC (or ~1h with Fast Lane). Here it compresses so you can feel the block.",
  chooseKicker: "Step 3 · Choose",
  chooseTitle: "Still inside the window: what happened?",
  chooseBody:
    "No breach → wait to settle and unwrap 1:1. Breach on-rail → open a claim while funds cannot free-exit.",
  settleTitle: "Window closed: unwrap 1:1",
  settleBody:
    "Credit settles. User can unwrap to USDC. No claim needed. Peg stays vault ≥ supply.",
  claimTitle: "Breach in window: Bind indemnifies",
  claimBody:
    "Lot freezes. Claims desk reviews. Approved claim remints settled cover to the rightful party.",
  usdcIn: "USDC in",
  cover: "Cover credit",
  freeExit: "Free exit",
  blocked: "Blocked",
  window: "Window",
  settled: "Settled",
  claim: "Claim",
};

const INTRO = 60; // 2s
const OUTRO = 45; // 1.5s
const TOTAL = INTRO + BIND_DEMO_DURATION + OUTRO;

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="BindDemoFlow"
        component={BindDemoFlow}
        durationInFrames={TOTAL}
        fps={BIND_DEMO_FPS}
        width={BIND_DEMO_WIDTH}
        height={BIND_DEMO_HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};

const BindDemoFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence durationInFrames={INTRO}>
        <TitleCard
          kicker="Bind"
          title="Protected Deposit"
          body="Deposit → hold → settle or claim"
        />
      </Sequence>
      <Sequence from={INTRO} durationInFrames={BIND_DEMO_DURATION}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(106,143,156,0.18), transparent 55%), #0E100D",
            padding: 24,
          }}
        >
          <BindDemo labels={EN_LABELS} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={INTRO + BIND_DEMO_DURATION} durationInFrames={OUTRO}>
        <TitleCard
          kicker="Bind"
          title="Insurance for DeFi deposits"
          body="Protocols buy cover. Users get a protected window."
        />
      </Sequence>
    </AbsoluteFill>
  );
};

function TitleCard({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(245,67,7,0.12), transparent 50%), #0E100D",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        padding: 48,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          color: ACCENT,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {kicker}
      </p>
      <h1
        style={{
          margin: "18px 0 0",
          color: TEXT,
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: "20px 0 0",
          color: MUTED,
          fontSize: 22,
          maxWidth: 640,
          lineHeight: 1.45,
        }}
      >
        {body}
      </p>
    </AbsoluteFill>
  );
}
