"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  /** Replay key when step changes */
  playKey?: string | number;
  reduceMotion?: boolean;
};

/** Word-rise title (Bind-native; no GSAP Club / React Bits license). */
export function SplitRise({
  text,
  as: Tag = "h2",
  className,
  playKey,
  reduceMotion,
}: Props) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  return (
    <Tag
      key={playKey ?? text}
      className={cn("split-rise", className)}
      aria-label={text}
    >
      {words.map((w, i) =>
        w.trim() === "" ? (
          <span key={`s-${i}`}>{w}</span>
        ) : (
          <span key={`${playKey}-${i}`} className="split-rise__mask">
            <span
              className="split-rise__word"
              style={
                reduceMotion
                  ? undefined
                  : { animationDelay: `${Math.min(i, 12) * 40}ms` }
              }
            >
              {w}
            </span>
          </span>
        ),
      )}
    </Tag>
  );
}
