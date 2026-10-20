import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { CopyTextButton } from "@/components/site/copy-text-button";
import { PageHeader } from "@/components/site/section-heading";
import { SocialLinks } from "@/components/site/social-links";
import { buildMetadata } from "@/lib/seo";
import { getProfile, getSiteSettings } from "@/server/queries/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: "联系",
      description: "项目合作、技术交流、内推机会，欢迎传讯。",
      path: "/contact",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function ContactPage() {
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);
  const email = profile?.email || "";

  return (
    <div className="container-page py-12 lg:py-16">
      <PageHeader
        eyebrow="传讯"
        title="留下传讯方式"
        description="项目合作、技术交流、内推机会，都欢迎。"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="sr-only">
            联系表单
          </h2>
          <div className="rounded-[12px] border border-line bg-surface p-6 lg:p-8">
            <ContactForm />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-medium">
              <Mail size={17} aria-hidden style={{ color: "var(--gold)" }} />
              直接联系
            </h2>
            {email ? (
              <div className="mt-3">
                <a
                  href={`mailto:${email}`}
                  className="break-all text-sm text-primary underline decoration-line underline-offset-4"
                >
                  {email}
                </a>
                <div className="mt-2">
                  <CopyTextButton value={email} label="复制邮箱" copiedLabel="邮箱已复制" />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">邮箱尚未配置，请使用左侧表单。</p>
            )}
            {settings.socialLinks.length > 0 ? (
              <div className="mt-4 border-t border-line pt-4">
                <p className="caption mb-2 text-muted">社交平台</p>
                <SocialLinks links={settings.socialLinks} className="-ml-3" />
              </div>
            ) : null}
          </div>

          <div className="rounded-[12px] border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-medium">
              <Clock size={17} aria-hidden style={{ color: "var(--gold)" }} />
              回复时间
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              通常 1-2 个工作日内回复。涉及具体项目时，附上背景、目标与时间预期会更快推进。
            </p>
          </div>

          <div className="rounded-[12px] border border-dashed border-line p-6">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <MessageSquare size={15} aria-hidden className="mt-0.5 shrink-0" />
              表单内容仅用于回复，不做营销用途，也不会提供给第三方。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
