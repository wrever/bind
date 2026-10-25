import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/demo", label: "Demo" },
  { href: "/integrate", label: "Integrate" },
  { href: "/ops", label: "Ops" },
  { href: "/por", label: "PoR" },
  { href: "/cover", label: "Cover" },
  { href: "/policy", label: "Claims" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="keel-meta flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-2 md:px-10">
        <span>
          [ BD-001 ] · Bind ·{" "}
          <span className="text-[var(--color-accent2)]">Status: Active</span>
        </span>
        <span className="hidden sm:inline tabular-nums">
          Mode: Protocol insurance · Demo/Testnet
        </span>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-10 md:py-4">
        <Link
          href="/"
          className="group flex min-h-[44px] items-center gap-3 shrink-0"
        >
          <BrandMark variant="header" priority />
          <span className="hidden border-l border-[var(--color-line)] pl-3 text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)] font-[family-name:var(--font-mono)] xl:inline">
            DeFi protocol insurance
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex max-w-[70%] flex-wrap items-center justify-end gap-0.5 sm:max-w-none sm:gap-1"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-[44px] items-center rounded px-2 py-2 text-sm text-[var(--color-muted)] transition-colors duration-[var(--motion-quick)] hover:text-[var(--color-text)] md:px-3"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-1">
            <Link href="/demo">Open console</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
