import Image from "next/image";

/** Product visual for Bind landing — retention rail HUD (not decorative). */

export function LandingRail() {
  return (
    <aside
      aria-label="Retention cover readout"
      className="relative w-full border border-[var(--color-line)] bg-[var(--color-surface)]"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/icon.svg"
            alt=""
            width={22}
            height={24}
            className="h-5 w-auto opacity-90"
            unoptimized
            aria-hidden
          />
          <p className="keel-meta">
            [ RC-001 ] · Retention Cover ·{" "}
            <span className="text-[var(--color-accent2)]">LIVE</span>
          </p>
        </div>
        <p className="keel-meta hidden sm:block">VAULT ≥ SUPPLY</p>
      </div>

      <div className="grid gap-0 md:grid-cols-12">
        <div className="border-b border-[var(--color-line)] p-5 md:col-span-7 md:border-b-0 md:border-r">
          <p className="keel-meta">Protected window</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
            12<span className="text-[var(--color-accent)]">h</span>
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No KYC default. Free unwrap / swap blocked while unsettled.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-2">
              <span className="keel-meta">T-0 deposit</span>
              <span className="keel-meta">T settle</span>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg)]">
              <div className="absolute inset-y-0 left-0 w-[68%] bg-[var(--color-accent)] opacity-90 animate-keel-fill" />
              <div className="pointer-events-none absolute inset-y-0 left-0 animate-keel-scan" />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <StatusChip label="FREE EXIT" value="BLOCKED" tone="warn" />
              <StatusChip label="EXIT POOL" value="PAID" tone="live" />
              <StatusChip label="CLAIM" value="IN-WINDOW" tone="ok" />
            </div>
          </div>
        </div>

        <div className="grid grid-rows-3 md:col-span-5">
          <ReadoutRow code="01" title="Deposit" body="USDC → covered credit" />
          <ReadoutRow
            code="02"
            title="Hold"
            body="Unsettled · risk window open"
          />
          <ReadoutRow
            code="03"
            title="Settle / claim"
            body="Unwrap 1:1 or indemnify"
            last
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-[var(--color-accent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[var(--color-accent)]"
      />
    </aside>
  );
}

function StatusChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warn" | "live" | "ok";
}) {
  const valueClass =
    tone === "warn"
      ? "text-[var(--color-accent)]"
      : tone === "live"
        ? "text-[var(--color-accent2)]"
        : "text-[var(--color-text)]";
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="keel-meta">{label}</span>
      <span
        className={`font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.08em] ${valueClass}`}
      >
        {value}
      </span>
    </span>
  );
}

function ReadoutRow({
  code,
  title,
  body,
  last,
}: {
  code: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 px-5 py-4 ${last ? "" : "border-b border-[var(--color-line)]"}`}
    >
      <span className="keel-meta shrink-0 tabular-nums">{code}</span>
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--color-text)]">
          {title}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
      </div>
    </div>
  );
}
