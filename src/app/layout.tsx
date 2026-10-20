import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteSettings } from "@/server/queries/site";
import { absoluteUrl } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF3E6" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1420" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.defaultSeoTitle || settings.siteName;
  const description =
    settings.defaultSeoDesc || settings.tagline || "个人作品、技能与手记。";
  const ogImage = settings.defaultOgImageUrl || "/default-og.png";

  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: {
      default: title,
      template: `%s · ${settings.siteName}`,
    },
    description,
    applicationName: settings.siteName,
    authors: [{ name: settings.siteName }],
    alternates: {
      canonical: absoluteUrl("/"),
      types: { "application/rss+xml": absoluteUrl("/rss.xml") },
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: settings.siteName,
      title,
      description,
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
    icons: { icon: "/icon.svg" },
  };
}

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark', s ? s === 'dark' : m);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(settings.primaryColor)
    ? settings.primaryColor
    : "#1F7F91";

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style>{`:root{--brand:${safeColor};}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
