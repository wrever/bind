"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  alert?: boolean;
  show?: boolean;
};

/** Soft enter chip — no blur/glow. */
export function FadeChip({
  children,
  className,
  delayMs = 0,
  alert,
  show = true,
}: Props) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "fade-chip inline-flex items-center rounded border px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em]",
        alert
          ? "border-[var(--color-alert)] text-[var(--color-alert)]"
          : "border-[var(--color-line)] text-[var(--color-muted)]",
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </span>
  );
}
