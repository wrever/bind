"use client";

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
export const BIND_DEMO_HEIGHT = 720;

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

const SURFACE = "rgba(14, 16, 13, 0.42)";
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
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "8px 28px 28px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 840,
            minHeight: 420,
            border: `1px solid ${LINE}`,
            background: SURFACE,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            padding: "22px 32px 28px",
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Step dots */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
              alignItems: "center",
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
              marginBottom: 22,
              position: "relative",
              overflow: "hidden",
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

          <div style={{ position: "relative", minHeight: 320 }}>
            {/* —— DEPOSIT —— */}
            <Scene opacity={deposit}>
              <Kicker>{labels.depositKicker}</Kicker>
              <Title>{labels.depositTitle}</Title>
              <Body>{labels.depositBody}</Body>

              {/* Big visual: wallet → Bind rail */}
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
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
              <Kicker>{labels.holdKicker}</Kicker>
              <Title>{labels.holdTitle}</Title>
              <Body>{labels.holdBody}</Body>

              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                }}
              >
                <TimerRing pct={holdPct} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: MUTED, fontSize: 13 }}>
                      {labels.window}
                    </span>
                    <span
                      style={{
                        color: TEXT,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {Math.round(holdPct * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
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
                      margin: "14px 0 0",
                      color: ACCENT,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {labels.freeExit}: {labels.blocked}
                  </p>
                </div>
              </div>
            </Scene>

            {/* —— CHOOSE —— */}
            <Scene opacity={choose}>
              <Kicker>{labels.chooseKicker}</Kicker>
              <Title>{labels.chooseTitle}</Title>
              <Body>{labels.chooseBody}</Body>
              <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
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
            </Scene>

            {/* —— SETTLE —— */}
            <Scene opacity={settle}>
              <Kicker>{labels.settled}</Kicker>
              <Title>{labels.settleTitle}</Title>
              <Body>{labels.settleBody}</Body>
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <NodeBox label="Cover" value="100" tone="accent" active />
                <FlowTrack progress={1} accent />
                <NodeBox label="Wallet" value="100 USDC" tone="steel" active />
              </div>
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
              <Kicker>{labels.claim}</Kicker>
              <Title>{labels.claimTitle}</Title>
              <Body>{labels.claimBody}</Body>
              <div
                style={{
                  marginTop: 28,
                  border: `1px solid ${ACCENT}66`,
                  background: `${ACCENT}14`,
                  padding: "20px 22px",
                  display: "flex",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    border: `2px solid ${ACCENT}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: "0.06em",
                  }}
                >
                  LOCK
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontWeight: 700, fontSize: 18 }}>
                    Lot frozen · claim open
                  </div>
                  <div style={{ color: MUTED, marginTop: 6, fontSize: 14 }}>
                    {labels.freeExit}: {labels.blocked}
                  </div>
                </div>
              </div>
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

function Scene({
  children,
  opacity,
}: {
  children: React.ReactNode;
  opacity: number;
}) {
  if (opacity <= 0.02) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 12,
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

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: "12px 0 0",
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: TEXT,
        lineHeight: 1.15,
      }}
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "12px 0 0",
        fontSize: 15,
        lineHeight: 1.5,
        color: MUTED,
        maxWidth: 560,
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
        marginTop: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        border: `1px solid ${LINE}`,
        background: "rgba(0,0,0,0.28)",
        padding: 14,
      }}
    >
      {items.map((s) => (
        <div key={s.k}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {s.k}
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 17,
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
        flex: "0 0 200px",
        border: `1px solid ${active ? c : LINE}`,
        background: active ? `${c}18` : "rgba(0,0,0,0.25)",
        padding: "16px 18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 20,
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
        flex: 1,
        height: 3,
        background: "rgba(255,255,255,0.08)",
        position: "relative",
        margin: "0 4px",
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
          left: `calc(${progress * 100}% - 9px)`,
          top: -8,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: c,
          boxShadow: `0 0 16px ${c}`,
        }}
      />
    </div>
  );
}

function TimerRing({ pct }: { pct: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="6"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth="6"
        strokeLinecap="butt"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 48 48)"
      />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        fill={TEXT}
        fontSize="16"
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
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${active ? c : LINE}`,
        padding: "20px 18px",
        color: active ? TEXT : MUTED,
        background: active ? `${c}18` : "rgba(0,0,0,0.25)",
        transform: `scale(${active ? 1 : 0.97})`,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: MUTED }}>{hint}</div>
    </div>
  );
}
