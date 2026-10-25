import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const PRODUCT = [
  { href: "/integrate", label: "Integrate" },
  { href: "/cover", label: "Cover schedule" },
  { href: "/por", label: "Proof of reserves" },
  { href: "/demo", label: "Demo" },
] as const;

const RESOURCES = [
  { href: "/docs", label: "Documentation" },
  { href: "/policy", label: "Claims policy" },
  { href: "/terms", label: "Terms of service" },
] as const;

const PROTOCOL = [
  { href: "/cover", label: "What Bind covers" },
  { href: "/integrate", label: "For protocols" },
  { href: "/docs", label: "Threat model & vision" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text)]">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={`${title}-${l.href}-${l.label}`}>
            <Link
              href={l.href}
              className="text-sm text-[var(--color-muted)] transition-colors duration-[var(--motion-quick)] hover:text-[var(--color-text)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-flex min-h-[44px] items-center">
              <BrandMark variant="footer" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
              DeFi security insurance on Stellar. Protocols contract Bind;
              depositors get a protected retention window and in-window claims.
            </p>
            <Link
              href="/por"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <span
                className="size-1.5 rounded-full bg-[var(--color-accent2)]"
                aria-hidden
              />
              Proof of reserves is public
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7 md:gap-8 lg:col-span-8 lg:pl-8">
            <FooterColumn title="Product" links={PRODUCT} />
            <FooterColumn title="Resources" links={RESOURCES} />
            <FooterColumn title="Protocol" links={PROTOCOL} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="text-sm text-[var(--color-muted)]">
            © {year} Bind. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              href="/terms"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Terms
            </Link>
            <Link
              href="/policy"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Claims
            </Link>
            <Link
              href="/docs"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Docs
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
