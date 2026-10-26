"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
  reduceMotion?: boolean;
  /** Restart when this changes (e.g. step becomes active) */
  playKey?: string | number;
  /** Use locale grouping (e.g. 1,234.00) */
  locale?: boolean;
};

/** Simple ease-out count (Bind-native). */
export function CountUp({
  to,
  decimals = 2,
  durationMs = 800,
  className,
  reduceMotion,
  playKey,
  locale = false,
}: Props) {
  const [n, setN] = useState(reduceMotion ? to : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      setN(to);
      return;
    }
    fromRef.current = 0;
    setN(0);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(fromRef.current + (to - fromRef.current) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs, reduceMotion, playKey]);

  const text = locale
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : n.toFixed(decimals);

  return <span className={className}>{text}</span>;
}
