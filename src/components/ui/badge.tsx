import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "sea" | "warn" | "ok" | "mute";
}) {
  const tones = {
    default: "bg-[var(--color-surface)] text-[var(--color-text)]",
    sea: "border border-[var(--color-accent2)] text-[var(--color-accent2)] bg-transparent",
    warn: "border border-[var(--keel-amber)] text-[var(--keel-amber)] bg-transparent",
    ok: "border border-[var(--color-accent2)] text-[var(--color-accent2)] bg-transparent",
    mute: "bg-transparent border border-[var(--color-line)] text-[var(--color-muted)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] font-[family-name:var(--font-mono)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
