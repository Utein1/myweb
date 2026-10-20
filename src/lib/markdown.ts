import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import { toString as mdastToString } from "mdast-util-to-string";
import { readingTime } from "@/lib/reading-time";
import { excerpt } from "@/lib/utils";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

const CALLOUT_LABELS: Record<string, string> = {
  NOTE: "提示",
  TIP: "技巧",
  IMPORTANT: "重要",
  WARNING: "注意",
  CAUTION: "警告",
};

const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "figure", "figcaption", "span", "div"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel", "className"],
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-/]],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className"],
    span: [...(defaultSchema.attributes?.span ?? []), "className"],
    div: [...(defaultSchema.attributes?.div ?? []), "className"],
    figure: [...(defaultSchema.attributes?.figure ?? []), "className"],
    th: [...(defaultSchema.attributes?.th ?? []), "align"],
    td: [...(defaultSchema.attributes?.td ?? []), "align"],
  },
};

/** > [!NOTE] 提示块 → 带样式的 div（在 mdast 阶段处理） */
function remarkCallouts() {
  return (tree: unknown) => {
    visit(tree as never, "blockquote", (node: any) => {
      const first = node.children?.[0];
      if (first?.type !== "paragraph") return;
      const textNode = first.children?.[0];
      if (textNode?.type !== "text") return;
      const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i.exec(textNode.value);
      if (!match) return;
      const kind = match[1].toUpperCase();
      textNode.value = textNode.value.slice(match[0].length);
      node.data = {
        hName: "div",
        hProperties: { className: ["callout", `callout-${kind.toLowerCase()}`] },
      };
      node.children.unshift({
        type: "paragraph",
        data: { hName: "p", hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: CALLOUT_LABELS[kind] ?? "提示" }],
      });
    });
  };
}

function rehypeExternalLinks() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: any) => {
      if (node.tagName !== "a") return;
      const href: string | undefined = node.properties?.href;
      if (!href || !/^https?:/i.test(href)) return;
      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: "noopener noreferrer",
        className: [...(node.properties.className ?? []), "external-link"],
      };
    });
  };
}

function rehypeLazyImages() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: any) => {
      if (node.tagName !== "img") return;
      node.properties = {
        ...node.properties,
        loading: "lazy",
        decoding: "async",
      };
    });
  };
}

const htmlCache = new Map<string, RenderedMarkdown>();

export type RenderedMarkdown = {
  html: string;
  toc: TocItem[];
  minutes: number;
};

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const cacheKey = markdown;
  const cached = htmlCache.get(cacheKey);
  if (cached) return cached;

  let html = "";
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkCallouts)
      .use(remarkRehype)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: "wrap",
        properties: { className: ["heading-anchor"] },
      })
      .use(rehypeExternalLinks)
      .use(rehypeLazyImages)
      .use(rehypePrettyCode, {
        theme: { light: "github-light", dark: "github-dark" },
        keepBackground: false,
        defaultLang: "text",
      })
      .use(rehypeStringify)
      .process(markdown);
    html = String(file);
  } catch {
    // 高亮器异常时回退到无高亮渲染，保证内容可读
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkCallouts)
      .use(remarkRehype)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeSlug)
      .use(rehypeStringify)
      .process(markdown);
    html = String(file);
  }

  const result: RenderedMarkdown = {
    html,
    toc: extractToc(markdown),
    minutes: readingTime(markdown),
  };

  if (htmlCache.size > 60) {
    const firstKey = htmlCache.keys().next().value;
    if (firstKey) htmlCache.delete(firstKey);
  }
  htmlCache.set(cacheKey, result);
  return result;
}

export function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  visit(tree, "heading", (node: any) => {
    const text = mdastToString(node).trim();
    const id = slugger.slug(text);
    if ((node.depth === 2 || node.depth === 3) && text) {
      items.push({ id, text, depth: node.depth });
    }
  });

  return items;
}

/** 自动摘要：去掉 Markdown 标记后截取 */
export function markdownExcerpt(markdown: string, max = 120) {
  return excerpt(markdown, max);
}
