import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Shared chrome for internal Bind pages — matches landing atmosphere. */
export function PageShell({
  children,
  width = "prose",
}: {
  children: ReactNode;
  width?: "prose" | "wide" | "full";
}) {
  const max =
    width === "full"
      ? "max-w-6xl"
      : width === "wide"
        ? "max-w-5xl"
        : "max-w-3xl";

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <main className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-surface)]/35 to-transparent"
        />
        <div
          className={cn(
            "relative mx-auto space-y-12 px-5 pb-20 pt-10 sm:pt-12 md:px-10 md:pb-24 md:pt-14",
            max,
          )}
        >
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  meta,
  title,
  body,
  aside,
  actions,
}: {
  meta: string;
  title: string;
  body?: ReactNode;
  aside?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-keel-rise border-b border-[var(--color-line)] pb-10 md:pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0 max-w-2xl">
          <p className="keel-meta">{meta}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.5vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--color-text)]">
            {title}
          </h1>
          {body ? (
            <div className="mt-4 text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
              {body}
            </div>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {actions ? (
        <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </header>
  );
}

export function PageSection({
  title,
  children,
  index,
}: {
  title: string;
  children: ReactNode;
  /** Optional mono index like 01 */
  index?: string;
}) {
  return (
    <section className="animate-keel-rise-delay space-y-4 border-t border-[var(--color-line)] pt-10">
      <div className="flex items-baseline gap-4">
        {index ? (
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.08em] text-[var(--color-muted)]">
            {index}
          </span>
        ) : null}
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
        {children}
      </div>
    </section>
  );
}

export function CodePanel({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-bg)] p-4 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--color-accent2)] sm:p-5 sm:text-[13px]">
      {children}
    </pre>
  );
}

type AppHref =
  | "/"
  | "/integrate"
  | "/cover"
  | "/docs"
  | "/demo"
  | "/live"
  | "/por"
  | "/policy"
  | "/terms";

export function DocLink({
  href,
  title,
  body,
  external,
}: {
  href: AppHref | string;
  title: string;
  body: string;
  external?: boolean;
}) {
  const className =
    "group block border border-[var(--color-line)] bg-[var(--color-bg)] p-5 transition-colors duration-[var(--motion-quick)] hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface)]/40";

  const inner = (
    <>
      <div className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight text-[var(--color-text)]">
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
        {body}
      </p>
    </>
  );

  if (external) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href as AppHref} className={className}>
      {inner}
    </Link>
  );
}

export function PageCtaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-3 border-t border-[var(--color-line)] pt-10">
      {children}
    </div>
  );
}
