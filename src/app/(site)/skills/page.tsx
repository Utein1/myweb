import type { Metadata } from "next";
import { Code2, Compass, Layers, Palette, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/section-heading";
import { SkillCategoryNav } from "@/components/site/skill-category-nav";
import { SkillMeter } from "@/components/ui/skill-meter";
import { EmptyState } from "@/components/ui/empty-state";
import { TagPill } from "@/components/ui/tag-pill";
import { buildMetadata } from "@/lib/seo";
import { skillLevelName, SKILL_LEVELS } from "@/lib/constants";
import { getSkillCategories, getLearningSkills } from "@/server/queries/skills";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: "技能树",
      description: "以分类与熟练度呈现的技术栈：前端工程、工程化与架构、设计与协作。",
      path: "/skills",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

const ICONS: Record<string, typeof Code2> = {
  code: Code2,
  layers: Layers,
  palette: Palette,
  compass: Compass,
  sparkles: Sparkles,
  "code-2": Code2,
};

export default async function SkillsPage() {
  const [categories, learning] = await Promise.all([getSkillCategories(), getLearningSkills()]);
  const navItems = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.skills.length,
  }));

  return (
    <div className="container-page py-12 lg:py-16">
      <PageHeader
        eyebrow="魔导书"
        title="技能树"
        description="按分类整理的技术栈与熟练度。等级从「见习」到「大师」，说明见页面底部。"
      />

      {categories.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Sparkles size={40} />}
            title="技能树正在整理中"
            description="新的分类与技能会陆续补充。"
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <SkillCategoryNav categories={navItems} />
          </div>

          <div className="mt-10 space-y-14">
            {categories.map((category) => {
              const Icon = ICONS[category.icon ?? ""] ?? Sparkles;
              return (
                <section
                  key={category.id}
                  id={category.slug}
                  aria-labelledby={`${category.slug}-title`}
                  className="scroll-mt-32"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
                    >
                      <Icon size={19} aria-hidden />
                    </span>
                    <div>
                      <h2 id={`${category.slug}-title`} className="font-serif text-2xl font-semibold">
                        {category.name}
                      </h2>
                      <p className="caption text-muted">{category.skills.length} 项技能</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {category.skills.map((skill) => (
                      <article
                        key={skill.id}
                        className="group rounded-[12px] border border-line bg-surface p-5 transition-colors duration-250 hover:border-line-strong"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-[1.0625rem] font-medium">{skill.name}</h3>
                          {skill.learning ? (
                            <TagPill className="border-transparent" title="学习中">
                              学习中
                            </TagPill>
                          ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <SkillMeter level={skill.level} />
                          <span className="caption text-muted">{skillLevelName(skill.level)}</span>
                          {skill.years ? (
                            <span className="caption ml-auto font-mono text-muted">
                              {skill.years} 年
                            </span>
                          ) : null}
                        </div>
                        {skill.description ? (
                          <p className="mt-2.5 text-sm leading-relaxed text-muted">
                            {skill.description}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {learning.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10" aria-labelledby="learning-title">
          <h2 id="learning-title" className="font-serif text-xl font-medium">
            持续学习中
          </h2>
          <p className="mt-1 text-sm text-muted">正在补的短板，以及感兴趣的新方向。</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {learning.map((skill) => (
              <li key={skill.id}>
                <TagPill className="h-7 px-3 text-sm">{skill.name}</TagPill>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16 border-t border-line pt-10" aria-labelledby="levels-title">
        <h2 id="levels-title" className="font-serif text-xl font-medium">
          熟练度说明
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SKILL_LEVELS.map((level) => (
            <div key={level.level} className="rounded-[8px] border border-line bg-surface p-4">
              <dt className="flex items-center gap-2 text-sm font-medium">
                <span className="font-mono text-xs" style={{ color: "var(--gold)" }}>
                  {level.level}
                </span>
                {level.name}
              </dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-muted">{level.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
