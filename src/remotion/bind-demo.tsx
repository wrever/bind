"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const BIND_DEMO_FPS = 30;
export const BIND_DEMO_DURATION = 300;
export const BIND_DEMO_WIDTH = 1280;
/** Taller stage so the landing Player reads clearly (not a tiny 16:9 stamp). */
export const BIND_DEMO_HEIGHT = 900;

export type BindDemoLabels = {
  depositKicker: string;
  depositTitle: string;
  depositBody: string;
  holdKicker: string;
  holdTitle: string;
  holdBody: string;
  chooseKicker: string;
  chooseTitle: string;
  chooseBody: string;
  settleTitle: string;
  settleBody: string;
  claimTitle: string;
  claimBody: string;
  usdcIn: string;
  cover: string;
  freeExit: string;
  blocked: string;
  window: string;
  settled: string;
  claim: string;
};

const SURFACE = "rgba(14, 16, 13, 0.48)";
const LINE = "rgba(123, 164, 178, 0.45)";
const MUTED = "#A8ABA2";
const TEXT = "#F4F1EA";
const ACCENT = "#F54307";
const STEEL = "#6A8F9C";

export function BindDemo({ labels }: { labels: BindDemoLabels }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const deposit = interpolate(frame, [0, 52, 62], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hold = beat(frame, 62, 145);
  const choose = beat(frame, 145, 200);
  const settle = beat(frame, 200, 250);
  const claim = beat(frame, 250, BIND_DEMO_DURATION);

  const holdPct = interpolate(frame, [72, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const wrap = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const tokenX = interpolate(wrap, [0, 1], [0, 1]);
  const coverLit = frame > 28 ? 1 : interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const progress = interpolate(frame, [0, BIND_DEMO_DURATION - 1], [0, 100], {
    extrapolateRight: "clamp",
  });

  const stepIndex =
    frame < 62 ? 0 : frame < 145 ? 1 : frame < 200 ? 2 : frame < 250 ? 3 : 4;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <AbsoluteFill
        style={{
          justifyContent: "stretch",
          alignItems: "stretch",
          padding: "16px 28px 20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            border: `1px solid ${LINE}`,
            background: SURFACE,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            padding: "28px 40px 32px",
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Chrome — fixed height */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 2,
                  background:
                    i <= stepIndex ? ACCENT : "rgba(255,255,255,0.08)",
                  opacity: i === stepIndex ? 1 : i < stepIndex ? 0.7 : 0.35,
                }}
              />
            ))}
          </div>

          <div
            style={{
              height: 2,
              background: "rgba(255,255,255,0.06)",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${STEEL}, ${ACCENT})`,
              }}
            />
          </div>

          {/* Scenes fill every leftover pixel */}
          <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
            {/* —— DEPOSIT —— */}
            <Scene opacity={deposit}>
              <Copy>
                <Kicker>{labels.depositKicker}</Kicker>
                <Title>{labels.depositTitle}</Title>
                <Body>{labels.depositBody}</Body>
              </Copy>
              <Stage>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    width: "100%",
                    maxWidth: 980,
                  }}
                >
                  <NodeBox
                    label="Wallet"
                    value="100 USDC"
                    tone="steel"
                    active={tokenX < 0.85}
                  />
                  <FlowTrack progress={tokenX} />
                  <NodeBox
                    label="Bind rail"
                    value={coverLit > 0.5 ? "100 Cover" : "—"}
                    tone="accent"
                    active={coverLit > 0.4}
                  />
                </div>
              </Stage>
              <Stats
                items={[
                  { k: labels.usdcIn, v: "100" },
                  {
                    k: labels.cover,
                    v: coverLit > 0.5 ? "100" : "—",
                    accent: coverLit > 0.5,
                  },
                  { k: labels.freeExit, v: "n/a" },
                ]}
              />
            </Scene>

            {/* —— HOLD —— */}
            <Scene opacity={hold}>
              <Copy>
                <Kicker>{labels.holdKicker}</Kicker>
                <Title>{labels.holdTitle}</Title>
                <Body>{labels.holdBody}</Body>
              </Copy>
              <Stage>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 36,
                    width: "100%",
                    maxWidth: 920,
                  }}
                >
                  <TimerRing pct={holdPct} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ color: MUTED, fontSize: 15 }}>
                        {labels.window}
                      </span>
                      <span
                        style={{
                          color: TEXT,
                          fontWeight: 700,
                          fontSize: 18,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {Math.round(holdPct * 100)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 12,
                        background: "rgba(0,0,0,0.35)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${holdPct * 100}%`,
                          height: "100%",
                          background: ACCENT,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        margin: "18px 0 0",
                        color: ACCENT,
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {labels.freeExit}: {labels.blocked}
                    </p>
                  </div>
                </div>
              </Stage>
            </Scene>

            {/* —— CHOOSE —— */}
            <Scene opacity={choose}>
              <Copy>
                <Kicker>{labels.chooseKicker}</Kicker>
                <Title>{labels.chooseTitle}</Title>
                <Body>{labels.chooseBody}</Body>
              </Copy>
              <Stage>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    width: "100%",
                    height: "100%",
                    maxHeight: 280,
                    alignItems: "stretch",
                  }}
                >
                  <ChoiceCard
                    active={frame >= 168}
                    label={labels.settled}
                    hint="1:1 unwrap"
                    tone="steel"
                  />
                  <ChoiceCard
                    active={frame >= 178}
                    label={labels.claim}
                    hint="on-rail breach"
                    tone="accent"
                  />
                </div>
              </Stage>
            </Scene>

            {/* —— SETTLE —— */}
            <Scene opacity={settle}>
              <Copy>
                <Kicker>{labels.settled}</Kicker>
                <Title>{labels.settleTitle}</Title>
                <Body>{labels.settleBody}</Body>
              </Copy>
              <Stage>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    width: "100%",
                    maxWidth: 980,
                  }}
                >
                  <NodeBox label="Cover" value="100" tone="accent" active />
                  <FlowTrack progress={1} accent />
                  <NodeBox label="Wallet" value="100 USDC" tone="steel" active />
                </div>
              </Stage>
              <Stats
                items={[
                  { k: "USDC", v: "100" },
                  { k: labels.claim, v: "—" },
                  { k: "Peg", v: "OK" },
                ]}
              />
            </Scene>

            {/* —— CLAIM —— */}
            <Scene opacity={claim}>
              <Copy>
                <Kicker>{labels.claim}</Kicker>
                <Title>{labels.claimTitle}</Title>
                <Body>{labels.claimBody}</Body>
              </Copy>
              <Stage>
                <div
                  style={{
                    border: `1px solid ${ACCENT}66`,
                    background: `${ACCENT}14`,
                    padding: "36px 40px",
                    display: "flex",
                    gap: 28,
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 920,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      border: `2px solid ${ACCENT}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: ACCENT,
                      fontWeight: 800,
                      fontSize: 14,
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                    }}
                  >
                    LOCK
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: TEXT, fontWeight: 700, fontSize: 22 }}>
                      Lot frozen · claim open
                    </div>
                    <div style={{ color: MUTED, marginTop: 8, fontSize: 16 }}>
                      {labels.freeExit}: {labels.blocked}
                    </div>
                  </div>
                </div>
              </Stage>
            </Scene>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function beat(frame: number, start: number, end: number) {
  const fade = 10;
  return interpolate(
    frame,
    [start, start + fade, Math.max(start + fade + 1, end - fade), end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/** Full-bleed scene: copy on top, expanding stage, optional footer. */
function Scene({
  children,
  opacity,
}: {
  children: ReactNode;
  opacity: number;
}) {
  if (opacity <= 0.02) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateY(${(1 - opacity) * 10}px)`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {children}
    </div>
  );
}

function Copy({ children }: { children: ReactNode }) {
  return <div style={{ flexShrink: 0 }}>{children}</div>;
}

/** Grows to eat leftover vertical space and centers the beat visual. */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 14,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: STEEL,
        fontWeight: 600,
      }}
    >
      {children}
    </p>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        margin: "14px 0 0",
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: TEXT,
        lineHeight: 1.18,
      }}
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "12px 0 0",
        fontSize: 17,
        lineHeight: 1.55,
        color: MUTED,
        maxWidth: 680,
      }}
    >
      {children}
    </p>
  );
}

function Stats({
  items,
}: {
  items: { k: string; v: string; accent?: boolean }[];
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: "auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        border: `1px solid ${LINE}`,
        background: "rgba(0,0,0,0.28)",
        padding: 18,
      }}
    >
      {items.map((s) => (
        <div key={s.k}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {s.k}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 20,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: s.accent ? ACCENT : TEXT,
            }}
          >
            {s.v}
          </div>
        </div>
      ))}
    </div>
  );
}

function NodeBox({
  label,
  value,
  tone,
  active,
}: {
  label: string;
  value: string;
  tone: "steel" | "accent";
  active?: boolean;
}) {
  const c = tone === "accent" ? ACCENT : STEEL;
  return (
    <div
      style={{
        flex: "1 1 200px",
        maxWidth: 280,
        border: `1px solid ${active ? c : LINE}`,
        background: active ? `${c}18` : "rgba(0,0,0,0.25)",
        padding: "28px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 26,
          fontWeight: 800,
          color: active ? c : TEXT,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FlowTrack({ progress, accent }: { progress: number; accent?: boolean }) {
  const c = accent ? ACCENT : STEEL;
  return (
    <div
      style={{
        flex: "1 1 120px",
        height: 4,
        background: "rgba(255,255,255,0.08)",
        position: "relative",
        margin: "0 8px",
        maxWidth: 280,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.max(4, progress * 100)}%`,
          background: c,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `calc(${progress * 100}% - 10px)`,
          top: -8,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: c,
          boxShadow: `0 0 16px ${c}`,
        }}
      />
    </div>
  );
}

function TimerRing({ pct }: { pct: number }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128" style={{ flexShrink: 0 }}>
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="7"
      />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth="7"
        strokeLinecap="butt"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="70"
        textAnchor="middle"
        fill={TEXT}
        fontSize="22"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function ChoiceCard({
  label,
  hint,
  active,
  tone,
}: {
  label: string;
  hint: string;
  active: boolean;
  tone: "steel" | "accent";
}) {
  const c = tone === "accent" ? ACCENT : STEEL;
  const style: CSSProperties = {
    flex: 1,
    border: `1px solid ${active ? c : LINE}`,
    padding: "32px 28px",
    color: active ? TEXT : MUTED,
    background: active ? `${c}18` : "rgba(0,0,0,0.25)",
    transform: `scale(${active ? 1 : 0.98})`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 160,
  };
  return (
    <div style={style}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 12, fontSize: 15, color: MUTED }}>{hint}</div>
    </div>
  );
}
