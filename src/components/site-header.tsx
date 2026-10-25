import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/integrate", label: "Integrate" },
  { href: "/cover", label: "Cover" },
  { href: "/docs", label: "Docs" },
  { href: "/por", label: "Reserves", live: true },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-10 md:py-4">
        <div className="flex min-w-0 items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="flex min-h-[44px] shrink-0 items-center"
            aria-label="Bind home"
          >
            <BrandMark variant="header" priority />
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2.5 py-2 text-sm text-[var(--color-muted)] transition-colors duration-[var(--motion-quick)] hover:text-[var(--color-text)]"
              >
                {l.label}
                {"live" in l && l.live ? (
                  <span
                    className="size-1.5 rounded-full bg-[var(--color-accent2)]"
                    title="Live proof of reserves"
                    aria-hidden
                  />
                ) : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/demo"
            className="hidden min-h-[44px] items-center px-3 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:inline-flex"
          >
            Demo
          </Link>
          <Button asChild size="sm">
            <Link href="/integrate">
              Get cover
              <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
