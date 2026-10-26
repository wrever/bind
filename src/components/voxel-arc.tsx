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
 * Bind Voxel Arc — Canvas 2D recreation of React Bits Pro “Voxel Arc”:
 * a curved horizon of square voxels rolling like a calm sea.
 * Fills its parent (min 320px). Put content in `children` or overlay it.
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
    introRef.current = intro ? 0 : 1;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const base = parseColor(color);
    const accent = parseColor(accentColor);
    const bg = parseColor(backgroundColor);

    const cols = () =>
      Math.max(32, Math.min(80, Math.floor((44 + w / 16) * density)));
    const rows = () =>
      Math.max(22, Math.min(48, Math.floor((26 + h / 24) * density)));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, dprMax);
      w = Math.max(1, root!.clientWidth);
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
        introRef.current = Math.min(1, introRef.current + 0.022);
      }
      const introK = easeOut(introRef.current);

      ctx!.fillStyle = rgb(bg);
      ctx!.fillRect(0, 0, w, h);

      const hz = h * horizon;
      // Wide dissolve so voxel tops never form a second hard crest line
      const crestFeather = h * 0.28;

      // Soft atmosphere — bleeds past the crest so there’s no knife-edge
      if (haze > 0) {
        const sky = ctx!.createLinearGradient(0, 0, 0, hz + crestFeather * 0.55);
        sky.addColorStop(0, rgb(bg, 1));
        sky.addColorStop(
          0.78,
          `rgba(${mix(bg, accent, 0.04 * glow).join(",")},${0.28 * haze})`,
        );
        sky.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = sky;
        ctx!.fillRect(0, 0, w, hz + crestFeather * 0.55);
      }

      const nx = cols();
      const nz = rows();
      const near = 1.05;
      const far = 7.4;
      const worldW = 6.2;
      const focal = h * 0.95;
      const camY = 1.05 + tilt * 0.32;
      // Project so the nearest row lands near the bottom edge of the canvas
      const nearScale = focal / (near * 52 + 36);
      const vMul =
        (h * Math.max(0.35, 0.98 - horizon)) /
        Math.max(0.001, camY * nearScale);

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
          const x = (xu - 0.5) * worldW * (1 + zu * 1.2);
          const elev = heightAt(x, z, t);
          const bend = (x * x) / (worldW * worldW) * curvature * 1.55;
          const scale = focal / (z * 52 + 36);
          const sx = w * 0.5 + x * scale * 100;
          const sy =
            hz +
            (camY - elev * 0.62 - bend) * scale * vMul +
            (1 - introK) * h * 0.12;
          const size = Math.max(
            1.5,
            scale * 46 * voxelSize * (0.88 + elev * 0.12),
          );
          const lit = clamp01(
            0.22 +
              elev * 0.55 +
              (1 - zu) * 0.18 +
              Math.max(0, elev) * 0.4 * glow,
          );
          pts.push({ sx, sy, size, lit: lit * brightness, depth: zu });
        }
      }

      const r = Math.max(0, Math.min(1, roundness));
      for (const p of pts) {
        // Start fading well below the horizon so tops never silhouette a 2nd wave
        const crestFade = clamp01(
          (p.sy - (hz - crestFeather * 0.55)) / (crestFeather * 1.15),
        );
        if (crestFade <= 0.04) continue;
        const fog = clamp01((p.depth - 0.08) / 0.92);
        const a =
          (0.38 + p.lit * 0.62) *
          (1 - fog * 0.58 * haze) *
          introK *
          crestFade;
        if (a < 0.04) continue;
        const c = mix(base, accent, clamp01(p.lit * 1.2 - 0.12));
        // No bloom near the crest — bloom was painting a ghost ridge above the sea
        const nearCrest = crestFade < 0.55;
        if (bloom > 0 && p.lit > 0.72 && !nearCrest) {
          ctx!.fillStyle = `rgba(${accent.join(",")},${(p.lit - 0.72) * bloom * 0.35 * introK * crestFade})`;
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

      // Soft under-crest wash only (no radial arc — that doubled the horizon)
      if (glow > 0) {
        const wash = ctx!.createLinearGradient(
          0,
          hz + crestFeather * 0.15,
          0,
          hz + crestFeather * 1.1,
        );
        wash.addColorStop(
          0,
          `rgba(${accent.join(",")},${0.06 * glow * introK})`,
        );
        wash.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = wash;
        ctx!.fillRect(0, hz + crestFeather * 0.1, w, crestFeather);
      }

      // Final crest dissolve into sky — kills any remaining silhouette
      {
        const dissolve = ctx!.createLinearGradient(
          0,
          hz - crestFeather * 0.75,
          0,
          hz + crestFeather * 0.85,
        );
        dissolve.addColorStop(0, rgb(bg, 1));
        dissolve.addColorStop(0.28, rgb(bg, 0.78));
        dissolve.addColorStop(0.55, rgb(bg, 0.35));
        dissolve.addColorStop(0.82, rgb(bg, 0.1));
        dissolve.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = dissolve;
        ctx!.fillRect(
          0,
          hz - crestFeather * 0.75,
          w,
          crestFeather * 1.7,
        );
      }

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

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(root);

    if (interactive) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
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
