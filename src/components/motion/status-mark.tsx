"use client";

import { cn } from "@/lib/utils";

type Status = "pending" | "running" | "done" | "failed";

type Props = {
  status: Status;
  size?: number;
  className?: string;
};

/** Minimal status glyph — Bind palette, no license dependency. */
export function StatusMark({ status, size = 14, className }: Props) {
  const stroke =
    status === "failed"
      ? "#F12A02"
      : status === "running"
        ? "#F54307"
        : "#F5F4F0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        opacity={status === "pending" ? 0.35 : 1}
        strokeDasharray={status === "pending" ? "2.2 2.8" : undefined}
      />
      {status === "running" ? (
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="#F54307"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="18 40"
          className="origin-center animate-spin"
          style={{ transformOrigin: "12px 12px", animationDuration: "1.2s" }}
        />
      ) : null}
      {status === "done" ? (
        <path
          d="M7.5 12.25 10.5 15.25 16.75 8.75"
          fill="none"
          stroke="#F5F4F0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {status === "failed" ? (
        <path
          d="M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"
          fill="none"
          stroke="#F12A02"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}
