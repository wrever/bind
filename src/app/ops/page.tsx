import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OpsConsole } from "@/components/ops-console";

export default function OpsPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <OpsConsole />
      <SiteFooter />
    </div>
  );
}
