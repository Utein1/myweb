import { HeaderBar } from "@/components/site/header-bar";
import { getSiteSettings } from "@/server/queries/site";

export async function SiteHeader() {
  const settings = await getSiteSettings();
  return <HeaderBar siteName={settings.siteName} emblemUrl={settings.emblemUrl} />;
}
