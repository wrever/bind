import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DemoConsole } from "@/components/demo-console";

export default function DemoPage() {
  return (
    <div className="keel-atmosphere min-h-screen">
      <SiteHeader />
      <DemoConsole />
      <SiteFooter />
    </div>
  );
}
