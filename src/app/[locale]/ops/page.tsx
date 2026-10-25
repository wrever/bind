import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OpsConsole } from "@/components/ops-console";

type Props = { params: Promise<{ locale: string }> };

export default async function OpsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <OpsConsole />
      <SiteFooter />
    </div>
  );
}
