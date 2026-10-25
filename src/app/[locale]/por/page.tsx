import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PorPanel } from "@/components/por-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function PorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <PorPanel />
      <SiteFooter />
    </div>
  );
}
