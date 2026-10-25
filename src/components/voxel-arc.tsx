"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type VoxelArcProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Trough / distance colour */
  color?: string;
  /** Crest / horizon light */
  accentColor?: string;
  backgroundColor?: string;
  density?: number;
  voxelSize?: number;
  roundness?: number;
  tilt?: number;
  horizon?: number;
  curvature?: number;
  waveHeight?: number;
  waveLength?: number;
  speed?: number;
  turbulence?: number;
  brightness?: number;
  glow?: number;
  haze?: number;
  bloom?: number;
  interactive?: boolean;
  ripples?: number;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
};

type Ripple = { x: number; z: number; t0: number; strength: number };

/**
 * Bind Voxel Arc — license-free recreation of the curved voxel sea.
 * Canvas 2D only (no WebGL), so it works in sandboxed previews too.
 */
export function VoxelArc({
  children,
  className = "",
  style,
  color = "#22211E",
  accentColor = "#F54307",
  backgroundColor = "#0E100D",
  density = 1,
  voxelSize = 0.55,
  roundness = 0.15,
  tilt = 1,
  horizon = 0.5,
  curvature = 0.55,
  waveHeight = 1,
  waveLength = 1,
  speed = 0.45,
  turbulence = 0.35,
  brightness = 1,
  glow = 1,
  haze = 0.75,
  bloom = 0.45,
  interactive = true,
  ripples = 1,
  intro = true,
  paused = false,
  dpr: dprMax = 2,
}: VoxelArcProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const pointerRef = useRef({ x: 0.5, y: 0.5, down: false });
  const introRef = useRef(intro ? 0 : 1);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const still = paused || reduceMotion;
    // Skip intro fade — sea must be visible on first paint
    introRef.current = 1;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const base = parseColor(color);
    const accent = parseColor(accentColor);
    const bg = parseColor(backgroundColor);

    const cols = () =>
      Math.max(28, Math.min(72, Math.floor((40 + w / 18) * density)));
    const rows = () =>
      Math.max(18, Math.min(42, Math.floor((22 + h / 28) * density)));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, dprMax);
      w = root!.clientWidth;
      h = Math.max(root!.clientHeight, 320);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function heightAt(x: number, z: number, t: number) {
      const wl = Math.max(0.35, waveLength);
      const s = still ? 0 : t * speed;
      let y =
        Math.sin(x * 1.1 * wl + s * 1.4) * 0.55 +
        Math.sin(z * 1.35 * wl - s * 1.1) * 0.7 +
        Math.sin((x + z) * 0.55 * wl + s * 0.7) * 0.35;
      y +=
        Math.sin(x * 2.4 * wl - s * 2.1) *
        Math.cos(z * 2.1 * wl + s) *
        turbulence *
        0.35;
      // pointer wake
      const pr = ripplesRef.current;
      for (let i = 0; i < pr.length; i++) {
        const r = pr[i]!;
        const age = (t - r.t0) * 1.6;
        if (age > 4) continue;
        const dx = x - r.x;
        const dz = z - r.z;
        const dist = Math.hypot(dx, dz);
        const ring = Math.sin(dist * 6 - age * 8) * Math.exp(-age * 1.1 - dist);
        y += ring * r.strength * ripples * 0.9;
      }
      return y * waveHeight;
    }

    function draw(now: number) {
      const t = now * 0.001;
      if (intro && introRef.current < 1) {
        introRef.current = Math.min(1, introRef.current + 0.028);
      }
      const introK = easeOut(introRef.current);

      ctx!.fillStyle = rgb(bg);
      ctx!.fillRect(0, 0, w, h);

      // soft sky haze above horizon
      const hz = h * horizon;
      if (haze > 0) {
        const sky = ctx!.createLinearGradient(0, 0, 0, hz);
        sky.addColorStop(0, rgb(bg, 1));
        sky.addColorStop(
          1,
          `rgba(${mix(bg, accent, 0.08 * glow).join(",")},${0.35 * haze})`,
        );
        ctx!.fillStyle = sky;
        ctx!.fillRect(0, 0, w, hz + 2);
      }

      const nx = cols();
      const nz = rows();
      const near = 1.05;
      const far = 7.2;
      const worldW = 5.8;
      const focal = h * 0.92;
      const camY = 1.15 + tilt * 0.35;

      type Point = {
        sx: number;
        sy: number;
        size: number;
        lit: number;
        depth: number;
      };
      const pts: Point[] = [];

      for (let iz = nz - 1; iz >= 0; iz--) {
        const zu = iz / (nz - 1);
        const z = near + zu * (far - near);
        for (let ix = 0; ix < nx; ix++) {
          const xu = ix / (nx - 1);
          const x = (xu - 0.5) * worldW * (1 + zu * 1.15);
          const elev = heightAt(x, z, t);
          // sphere-ish horizon bend
          const bend = (x * x) / (worldW * worldW) * curvature * 1.4;
          const depth = z;
          const scale = focal / (depth * 55 + 40);
          const sx = w * 0.5 + x * scale * 95;
          // Vertical scale kept tighter so the near field stays on-canvas
          const sy =
            hz +
            (camY - elev * 0.55 - bend) * scale * 48 +
            (1 - introK) * h * 0.1;
          const size = Math.max(
            1.4,
            scale * 42 * voxelSize * (0.85 + elev * 0.08),
          );
          const lit = clamp01(
            0.2 +
              elev * 0.55 +
              (1 - zu) * 0.15 +
              Math.max(0, elev) * 0.35 * glow,
          );
          pts.push({ sx, sy, size, lit: lit * brightness, depth: zu });
        }
      }

      // back → front already from iz loop; draw
      const r = Math.max(0, Math.min(1, roundness));
      for (const p of pts) {
        const fog = clamp01((p.depth - 0.15) / 0.85);
        const a = (0.35 + p.lit * 0.65) * (1 - fog * 0.55 * haze) * introK;
        if (a < 0.04) continue;
        const c = mix(base, accent, clamp01(p.lit * 1.15 - 0.15));
        // bloom wash on bright crest
        if (bloom > 0 && p.lit > 0.72) {
          ctx!.fillStyle = `rgba(${accent.join(",")},${(p.lit - 0.72) * bloom * 0.45 * introK})`;
          roundRect(
            ctx!,
            p.sx - p.size * 0.85,
            p.sy - p.size * 0.85,
            p.size * 1.7,
            p.size * 1.7,
            p.size * r,
          );
          ctx!.fill();
        }
        ctx!.fillStyle = `rgba(${c.join(",")},${a})`;
        roundRect(
          ctx!,
          p.sx - p.size / 2,
          p.sy - p.size / 2,
          p.size,
          p.size,
          p.size * r * 0.5,
        );
        ctx!.fill();
      }

      // horizon glow arc
      if (glow > 0) {
        const g = ctx!.createRadialGradient(
          w * 0.5,
          hz,
          w * 0.02,
          w * 0.5,
          hz,
          w * 0.55,
        );
        g.addColorStop(0, `rgba(${accent.join(",")},${0.22 * glow * introK})`);
        g.addColorStop(0.45, `rgba(${accent.join(",")},${0.06 * glow * introK})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, hz - h * 0.2, w, h * 0.45);
      }

      // soft top vignette — keep aurora under the hero
      const vig = ctx!.createLinearGradient(0, 0, 0, h * 0.28);
      vig.addColorStop(0, rgb(bg, 0.28));
      vig.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, w, h * 0.28);

      // Deep bottom fade — handoff into page bg / next section
      const bot = ctx!.createLinearGradient(0, h * 0.62, 0, h);
      bot.addColorStop(0, "rgba(0,0,0,0)");
      bot.addColorStop(0.45, rgb(bg, 0.35));
      bot.addColorStop(0.75, rgb(bg, 0.78));
      bot.addColorStop(1, rgb(bg, 1));
      ctx!.fillStyle = bot;
      ctx!.fillRect(0, h * 0.62, w, h * 0.38);

      // prune old ripples
      const pr = ripplesRef.current;
      if (pr.length) {
        ripplesRef.current = pr.filter((x) => t - x.t0 < 4.5);
      }
    }

    function loop(now: number) {
      draw(now);
      if (!still) raf = requestAnimationFrame(loop);
    }

    function worldFromPointer(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      pointerRef.current.x = px;
      pointerRef.current.y = py;
      // approximate map into wave space
      return {
        x: (px - 0.5) * 5.5,
        z: 1.2 + clamp01((py - horizon) / (1 - horizon)) * 5.5,
      };
    }

    function onMove(e: PointerEvent) {
      if (!interactive) return;
      const { x, z } = worldFromPointer(e.clientX, e.clientY);
      if (pointerRef.current.down || Math.random() < 0.08) {
        ripplesRef.current.push({
          x,
          z,
          t0: performance.now() * 0.001,
          strength: 0.35 * ripples,
        });
      }
      if (still) draw(performance.now());
    }

    function onDown(e: PointerEvent) {
      if (!interactive) return;
      pointerRef.current.down = true;
      const { x, z } = worldFromPointer(e.clientX, e.clientY);
      ripplesRef.current.push({
        x,
        z,
        t0: performance.now() * 0.001,
        strength: 1.1 * ripples,
      });
    }

    function onUp() {
      pointerRef.current.down = false;
    }

    resize();
    draw(performance.now());
    if (!still) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [
    color,
    accentColor,
    backgroundColor,
    density,
    voxelSize,
    roundness,
    tilt,
    horizon,
    curvature,
    waveHeight,
    waveLength,
    speed,
    turbulence,
    brightness,
    glow,
    haze,
    bloom,
    interactive,
    ripples,
    intro,
    paused,
    dprMax,
  ]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate min-h-[320px] w-full overflow-hidden",
        className,
      )}
      style={{ backgroundColor, ...style }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-hidden
      />
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : null}
    </div>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function parseColor(input: string): [number, number, number] {
  if (input.startsWith("#")) {
    const h = input.slice(1);
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const n = Number.parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return [14, 16, 13];
}

function rgb(c: [number, number, number], a = 1) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const k = clamp01(t);
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2);
  if (r <= 0.5) {
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
