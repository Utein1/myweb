import "server-only";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

type SeoInput = {
  title?: string | null;
  /** 首页等页面直接使用完整标题，不再拼接「· 站点名」模板 */
  absoluteTitle?: boolean;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
  noindex?: boolean;
};

export function buildMetadata(
  input: SeoInput,
  defaults: { siteName: string; title?: string | null; description?: string | null; ogImage?: string | null },
): Metadata {
  const siteName = defaults.siteName;
  const title = input.title?.trim() || defaults.title || siteName;
  const description =
    input.description?.trim() || defaults.description || `${siteName} — 个人作品与手记`;
  const image = input.image || defaults.ogImage || "/default-og.png";
  const url = absoluteUrl(input.path);

  return {
    title: input.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: input.noindex ? undefined : { canonical: url },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? "website",
      siteName,
      title,
      description,
      url,
      locale: "zh_CN",
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
      ...(input.type === "article"
        ? {
            publishedTime: input.publishedTime ? new Date(input.publishedTime).toISOString() : undefined,
            modifiedTime: input.modifiedTime ? new Date(input.modifiedTime).toISOString() : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
