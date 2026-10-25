import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#0E100D",
};

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-display",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("title"),
    description: t("description"),
    manifest: "/site.webmanifest",
    // favicon.ico / icon.svg / apple-icon.png live in src/app (Next file convention)
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bind" }],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-[family-name:var(--font-sans)] antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <LocaleSwitcher />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
