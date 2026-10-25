"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const CODES: Record<AppLocale, string> = {
  en: "EN",
  es: "ES",
  pt: "PT",
};

export function LocaleSwitcher() {
  const t = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 left-5 z-40 md:bottom-6 md:left-6"
    >
      <div className="relative">
        {open ? (
          <div
            role="listbox"
            aria-label={t("label")}
            className="absolute bottom-full left-0 mb-2 min-w-[7.5rem] overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg)]/95 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md"
          >
            {routing.locales.map((l) => {
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    active
                      ? "bg-[var(--color-surface)] text-[var(--color-text)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  }`}
                  onClick={() => {
                    setOpen(false);
                    if (l !== locale) router.replace(pathname, { locale: l });
                  }}
                >
                  <span className="w-5 font-[family-name:var(--font-mono)] text-[10px] tracking-wide text-[var(--color-accent)]">
                    {CODES[l]}
                  </span>
                  {t(l)}
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={t("label")}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-bg)]/95 px-2.5 py-2 text-[11px] font-medium tracking-wide text-[var(--color-muted)] shadow-[0_4px_18px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          <Languages className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
          <span className="leading-none">
            <span className="block font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] text-[var(--color-text)]">
              {CODES[locale]}
            </span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {t("label")}
            </span>
          </span>
          <span
            aria-hidden
            className={`ml-0.5 text-[10px] text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      </div>
    </div>
  );
}
