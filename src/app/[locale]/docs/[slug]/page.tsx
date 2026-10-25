import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs/docs-shell";
import { allDocSlugs, getDoc } from "@/content/docs/catalog";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const slugs = allDocSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function DocsSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!getDoc(slug)) notFound();
  return <DocsShell slug={slug} />;
}
