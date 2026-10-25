import { setRequestLocale } from "next-intl/server";
import { LiveRail } from "@/components/live-rail";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = { params: Promise<{ locale: string }> };

export default async function LivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <LiveRail />
      <SiteFooter />
    </div>
  );
}
