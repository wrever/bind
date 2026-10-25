"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { searchDocs } from "@/content/docs/catalog";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";

export function DocsSearch() {
  const t = useTranslations("DocsSite");
  const locale = useLocale() as AppLocale;
  const [q, setQ] = useState("");
  const results = useMemo(
    () => (q.trim().length >= 2 ? searchDocs(locale, q) : []),
    [locale, q],
  );

  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-10 bg-[var(--color-bg)]"
        aria-label={t("searchPlaceholder")}
      />
      {results.length > 0 ? (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto border border-[var(--color-line)] bg-[var(--color-bg)] shadow-lg">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/docs/${r.slug}`}
                onClick={() => setQ("")}
                className="block border-b border-[var(--color-line)] px-3 py-2.5 hover:bg-[var(--color-surface)]/50"
              >
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {r.title}
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-[var(--color-muted)]">
                  {r.description}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {q.trim().length >= 2 && results.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--color-muted)]">{t("searchEmpty")}</p>
      ) : null}
    </div>
  );
}
