import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { Prose } from "@/components/site/prose";
import { TagPill } from "@/components/ui/tag-pill";
import { Badge } from "@/components/ui/badge";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, formatDateShort } from "@/lib/format";
import { getPreviewPost } from "@/server/queries/posts";
import { getAdminProject } from "@/server/queries/projects";
import { PROJECT_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "草稿预览 · 档案管理台",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "post" && type !== "project") notFound();

  const post = type === "post" ? await getPreviewPost(id) : null;
  const project = type === "project" ? await getAdminProject(id) : null;
  if (!post && !project) notFound();

  const markdown = post?.content ?? project?.content ?? "";
  const { html, minutes } = await renderMarkdown(markdown);

  return (
    <div className="mx-auto max-w-[760px]">
      <div
        className="mb-6 flex flex-wrap items-center gap-3 rounded-[8px] border px-4 py-2.5 text-xs"
        style={{
          borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--warning) 9%, transparent)",
          color: "var(--warning)",
        }}
        role="status"
      >
        <Eye size={14} aria-hidden />
        <span className="font-medium">草稿预览</span>
        <span>当前内容尚未发布，只有登录后台可见。</span>
        <Link
          href={post ? `/admin/posts/${post.id}` : `/admin/projects/${project?.id}`}
          className="ml-auto underline underline-offset-4"
        >
          返回编辑
        </Link>
      </div>

      {post ? (
        <article>
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={post.status === "PUBLISHED" ? "success" : "warning"}>
                {post.status === "PUBLISHED" ? "已发布" : post.status === "SCHEDULED" ? "定时" : "草稿"}
              </Badge>
              <span className="caption text-muted">
                {post.publishedAt ? formatDate(post.publishedAt) : "未设置发布时间"} · 约 {minutes} 分钟
              </span>
            </div>
            <h1 className="page-title mt-3">{post.title}</h1>
            {post.summary ? <p className="mt-3 text-muted">{post.summary}</p> : null}
            {post.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map(({ tag }) => (
                  <TagPill key={tag.id}>{tag.name}</TagPill>
                ))}
              </div>
            ) : null}
          </header>
          <div className="mt-8">
            <Prose html={html} />
          </div>
        </article>
      ) : null}

      {project ? (
        <article>
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={(PROJECT_STATUS[project.status] ?? PROJECT_STATUS.PLANNED).tone} dot>
                {(PROJECT_STATUS[project.status] ?? PROJECT_STATUS.PLANNED).label}
              </Badge>
              <Badge tone={project.publishedAt ? "success" : "warning"}>
                {project.publishedAt ? "已发布" : "草稿"}
              </Badge>
              {project.featured ? <Badge tone="warning">精选</Badge> : null}
              <span className="caption text-muted">
                {project.startDate ? formatDateShort(project.startDate) : "—"}
                {" – "}
                {project.endDate ? formatDateShort(project.endDate) : "至今"}
              </span>
            </div>
            <h1 className="page-title mt-3">{project.title}</h1>
            {project.summary ? <p className="mt-3 text-muted">{project.summary}</p> : null}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map(({ tag }) => (
                <TagPill key={tag.id}>{tag.name}</TagPill>
              ))}
            </div>
          </header>

          {project.coverUrl ? (
            <div className="cover-frame mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.coverUrl} alt="" />
            </div>
          ) : null}

          <div className="mt-8">
            <Prose html={html} />
          </div>

          {project.images.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {project.images.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt || `${project.title} 截图 ${index + 1}`}
                  className="w-full rounded-[8px] border border-line"
                />
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
