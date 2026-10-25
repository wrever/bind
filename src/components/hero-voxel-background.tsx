"use client";

import { useEffect, useRef } from "react";

type Voxel = {
  x: number;
  y: number;
  s: number;
  accent: boolean;
  phase: number;
};

/**
 * Canvas 2D voxel arc — no WebGL.
 * Works in sandboxed browsers where THREE.WebGLRenderer fails.
 */
export function HeroVoxelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let voxels: Voxel[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: 0.5, y: 0.45 };

    function build() {
      voxels = [];
      const cols = Math.min(22, Math.max(14, Math.floor(w / 70)));
      const rows = 5;
      const cx = w * 0.5;
      const cy = h * 0.62;
      const radius = Math.min(w, h) * 0.48;
      for (let i = 0; i < cols; i++) {
        const u = i / (cols - 1);
        const angle = Math.PI * (0.12 + u * 0.76);
        const baseX = cx + Math.cos(angle) * radius;
        const baseY = cy - Math.sin(angle) * radius * 0.55;
        for (let j = 0; j < rows; j++) {
          const size = Math.max(10, Math.min(22, w * 0.018));
          voxels.push({
            x: baseX + (j % 2) * (size * 0.15),
            y: baseY + j * (size * 0.92),
            s: size * (0.9 + ((i + j) % 3) * 0.05),
            accent: (i + j) % 6 === 0 || (j === 2 && (i === 3 || i === cols - 4)),
            phase: i * 0.4 + j * 0.55,
          });
        }
      }
    }

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw(t: number) {
      ctx!.fillStyle = "#0E100D";
      ctx!.fillRect(0, 0, w, h);

      const parallaxX = (pointer.x - 0.5) * 28;
      const parallaxY = (pointer.y - 0.5) * 16;
      const time = reduceMotion ? 0 : t * 0.001;

      for (const v of voxels) {
        const bob = reduceMotion ? 0 : Math.sin(time * 0.9 + v.phase) * 3;
        const x = v.x + parallaxX * (v.accent ? 1.1 : 0.7);
        const y = v.y + parallaxY * 0.6 + bob;
        const depth = 0.55 + (v.y / h) * 0.45;

        // isometric-ish cube face
        ctx!.fillStyle = v.accent
          ? `rgba(245, 67, 7, ${0.55 + depth * 0.35})`
          : `rgba(42, 41, 38, ${0.45 + depth * 0.4})`;
        ctx!.fillRect(x - v.s / 2, y - v.s / 2, v.s, v.s);

        // top highlight edge
        ctx!.strokeStyle = v.accent
          ? "rgba(246, 95, 44, 0.7)"
          : "rgba(113, 112, 108, 0.35)";
        ctx!.lineWidth = 1;
        ctx!.strokeRect(x - v.s / 2 + 0.5, y - v.s / 2 + 0.5, v.s - 1, v.s - 1);
      }

      // vignette for copy readability
      const g = ctx!.createRadialGradient(
        w * 0.5,
        h * 0.42,
        h * 0.08,
        w * 0.5,
        h * 0.5,
        h * 0.75,
      );
      g.addColorStop(0, "rgba(14,16,13,0.15)");
      g.addColorStop(0.55, "rgba(14,16,13,0.55)");
      g.addColorStop(1, "rgba(14,16,13,0.92)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    function loop(now: number) {
      draw(now);
      if (!reduceMotion) raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
      if (reduceMotion) draw(0);
    }

    resize();
    draw(0);
    if (!reduceMotion) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#0E100D,transparent)]" />
    </div>
  );
}
