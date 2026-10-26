"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: string;
  className?: string;
};

/** Flat HH:MM:SS display — cyan tabular, no tile shadows. */
export function FlatTimer({ value, className }: Props) {
  const parts = value.split(":");
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 font-[family-name:var(--font-mono)] tabular-nums tracking-tight text-[var(--color-accent2)]",
        className,
      )}
      aria-label={value}
    >
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-baseline">
          {i > 0 ? (
            <span className="px-0.5 text-[var(--color-muted)]">:</span>
          ) : null}
          <span className="inline-block min-w-[1.35ch] text-center">{part}</span>
        </span>
      ))}
    </span>
  );
}
