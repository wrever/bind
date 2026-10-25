import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/integrate", label: "Integrate" },
  { href: "/cover", label: "Cover" },
  { href: "/docs", label: "Docs" },
  { href: "/por", label: "Reserves" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-10 md:py-4">
        <Link
          href="/"
          className="flex min-h-[44px] shrink-0 items-center"
          aria-label="Bind home"
        >
          <BrandMark variant="header" priority />
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center justify-end gap-0.5 sm:gap-1"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden min-h-[44px] items-center px-3 py-2 text-sm text-[var(--color-muted)] transition-colors duration-[var(--motion-quick)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" variant="outline" className="ml-1 hidden sm:inline-flex">
            <Link href="/demo">Demo</Link>
          </Button>
          <Button asChild size="sm" className="ml-1">
            <Link href="/integrate">Get cover</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
