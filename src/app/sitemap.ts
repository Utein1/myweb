import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/server/queries/projects";
import { getPublishedPostSlugs, getPublishedTags } from "@/server/queries/posts";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, tags] = await Promise.all([
    getPublishedProjectSlugs(),
    getPublishedPostSlugs(),
    getPublishedTags(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/skills"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog/archive"), changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: absoluteUrl(`/blog/tags/${tag.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
