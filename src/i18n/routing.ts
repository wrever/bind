import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "pt"],
  defaultLocale: "en",
  // "as-needed" triggers Next.js 16 rewrite→307 loops on the default locale
  // (x-middleware-rewrite absolute URL). Always-prefix keeps EN on /en/* and
  // avoids the broken rewrite path until upstream is fixed.
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
