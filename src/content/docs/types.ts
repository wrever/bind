import type { AppLocale } from "@/i18n/routing";

export type DocHeading = { id: string; title: string };

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; language?: string; text: string }
  | { type: "callout"; tone?: "info" | "warn"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocPage = {
  slug: string;
  section: string;
  order: number;
  title: Record<AppLocale, string>;
  description: Record<AppLocale, string>;
  /** Plain text optimized for LLM ingestion */
  llm: Record<AppLocale, string>;
  body: Record<AppLocale, DocBlock[]>;
};

export type DocNavItem = {
  slug: string;
  section: string;
  title: string;
};
