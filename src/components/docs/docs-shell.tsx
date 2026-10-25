"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  DOC_SECTIONS,
  docHeadings,
  getDoc,
  listDocs,
} from "@/content/docs/catalog";
import type { AppLocale } from "@/i18n/routing";
import { DocsBlocks } from "@/components/docs/docs-blocks";
import { DocsSearch } from "@/components/docs/docs-search";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function DocsShell({ slug }: { slug: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("DocsSite");
  const page = getDoc(slug);
  const nav = listDocs(locale);

  if (!page) {
    return (
      <p className="px-5 py-16 text-[var(--color-muted)] md:px-10">
        {t("notFound")}
      </p>
    );
  }

  const headings = docHeadings(page, locale);
  const sections = [...new Set(nav.map((n) => n.section))];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-10 md:pt-10">
      <div className="mb-8 max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {t("meta")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[var(--color-text)] md:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t("body")}</p>
        <div className="mt-4">
          <DocsSearch />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_180px]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={t("navAria")} className="space-y-6">
            {sections.map((section) => (
              <div key={section}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  {DOC_SECTIONS[section]?.[locale] ?? section}
                </p>
                <ul className="mt-2 space-y-1">
                  {nav
                    .filter((n) => n.section === section)
                    .map((n) => (
                      <li key={n.slug}>
                        <Link
                          href={`/docs/${n.slug}`}
                          className={cn(
                            "block border-l-2 py-1.5 pl-3 text-sm transition-colors",
                            n.slug === slug
                              ? "border-[var(--color-accent)] text-[var(--color-text)]"
                              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]",
                          )}
                        >
                          {n.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
          <p className="mt-8 text-xs text-[var(--color-muted)]">
            <a
              href="/llms.txt"
              className="text-[var(--color-accent2)] underline underline-offset-4"
            >
              llms.txt
            </a>
          </p>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-[var(--color-line)] pb-6">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold tracking-[-0.03em] text-[var(--color-text)]">
              {page.title[locale]}
            </h2>
            <p className="mt-3 text-[15px] text-[var(--color-muted)]">
              {page.description[locale]}
            </p>
          </header>
          <div className="pt-8">
            <DocsBlocks blocks={page.body[locale]} />
          </div>
          <aside className="mt-12 border border-[var(--color-line)] bg-[var(--color-surface)]/30 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              {t("llmLabel")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {page.llm[locale]}
            </p>
          </aside>
        </article>

        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            {t("onThisPage")}
          </p>
          <ul className="mt-3 space-y-2">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
                >
                  {h.title}
                </a>
              </li>
            ))}
            {headings.length === 0 ? (
              <li className="text-sm text-[var(--color-muted)]">—</li>
            ) : null}
          </ul>
        </aside>
      </div>
    </div>
  );
}
