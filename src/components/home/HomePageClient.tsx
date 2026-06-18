"use client";

import Link from "next/link";

import { ToolCard } from "@/components/ToolCard";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  getActiveAnnouncements,
  getFeaturedTool,
  getToolHomeCatch,
  getToolHomeDescription,
  getToolHomeName,
  getLiveToolsByCategory,
  getToolById,
  getVisibleGuides,
  isToolNew,
  type Tool,
} from "@/data/tools";
import { useCompletedTools } from "@/lib/completed-tools";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-[1.7rem] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[2rem]">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-[var(--color-text-sub)]">{description}</p> : null}
    </div>
  );
}

function GuideCard({
  title,
  description,
  steps,
  note,
}: {
  title: string;
  description: string;
  steps: Array<{ toolId: Tool["id"]; label: string }>;
  note?: string;
}) {
  const firstTool = steps[0] ? getToolById(steps[0].toolId) : undefined;
  const firstHref = firstTool ? (firstTool.id === "hensachi" ? "/hensachi?skip=1" : firstTool.path) : undefined;

  return (
    <article className="card p-6 sm:p-7">
      <h3 className="text-lg font-black leading-tight text-[var(--color-text)] sm:text-xl">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-sub)]">{description}</p>
      <ol className="mt-5 grid gap-4">
        {steps.map((step, index) => (
          <li key={`${step.toolId}-${index}`} className="text-sm leading-7 text-[var(--color-text)]">
            <span className="mr-2 font-bold text-[var(--color-main)]">{index + 1}.</span>
            {step.label}
          </li>
        ))}
      </ol>
      {note ? <p className="mt-5 text-sm leading-7 text-[var(--color-text-sub)]">{note}</p> : null}
      {firstTool ? (
        <Link href={firstHref ?? firstTool.path} className="text-link mt-6 inline-flex">
          1つ目から始める →
        </Link>
      ) : null}
    </article>
  );
}

type HomePageClientProps = {
  initialHasCompletedAnyTool?: boolean;
};

export function HomePageClient({ initialHasCompletedAnyTool = false }: HomePageClientProps) {
  const completedTools = useCompletedTools();
  const showFirstTimeSection = !initialHasCompletedAnyTool && completedTools.length === 0;
  const featuredTool = getFeaturedTool();
  const announcements = getActiveAnnouncements();
  const guides = getVisibleGuides();
  const heroHref = "/diagnoses/deai-fit";

  return (
    <section data-testid="home-page" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <header className="max-w-4xl">
        <h1
          data-testid="home-hero-heading"
          className="text-[2.35rem] font-black leading-tight tracking-[-0.03em] text-[var(--color-text)] sm:text-5xl lg:text-6xl"
        >
          診断で、
          <span className="block text-[var(--color-main)]">恋愛や婚活の癖を知る。</span>
        </h1>
        <div className="mt-6">
          <Link
            data-testid="home-hero-cta"
            href={heroHref}
            className="btn-primary inline-flex rounded-full px-6 py-3.5 text-sm font-bold sm:text-[15px]"
          >
            自分に合う出会い方を診断する →
          </Link>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-sub)] sm:text-lg">
          婚活がしんどいのは、あなたが悪いからではなく、
          自分に合わない頑張り方を続けているからかもしれません。
          <br className="hidden sm:block" />
          出会い方、理想の高さ、LINEの距離感、プロフィールの見せ方を診断しながら、
          自分に合う婚活の進め方を見つけるきっかけを作ります。
        </p>

        {announcements.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={announcement.url}
                className="btn-secondary gap-2 rounded-full px-4 py-2 text-sm font-bold text-[var(--color-main)]"
              >
                <span className="rounded-md bg-[var(--color-main)] px-2 py-1 text-[0.62rem] tracking-[0.14em] text-white">NEW</span>
                <span>{announcement.text}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {showFirstTimeSection && featuredTool ? (
        <section data-testid="home-first-step" className="mt-12 border-t border-[color:var(--line)] pt-10">
          <SectionHeading
            title="はじめての方へ"
            description="まずは、自分に合う会い方から整理できる診断です。採点ではなく、今の頑張り方を見直す入口として使ってください。"
          />
          <div className="mt-6 max-w-3xl">
            <ToolCard
              name={featuredTool.name}
              catch={featuredTool.catch}
              description={featuredTool.description}
              tags={featuredTool.tags}
              href={featuredTool.id === "deaiFit" ? heroHref : featuredTool.id === "hensachi" ? "/hensachi?skip=1" : featuredTool.path}
              cta={featuredTool.cta}
              isNew={isToolNew(featuredTool)}
              highlightBadge="はじめて向け"
            />
          </div>
        </section>
      ) : null}

      <section id="tool-list" className="mt-12 border-t border-[color:var(--line)] pt-10">
        <SectionHeading
          title="診断・ツール一覧"
          description="全部無料です。ネタとして遊びつつ、自分に合わない頑張り方を見直すヒントにしてください。"
        />

        <div className="mt-8 grid gap-12">
          {CATEGORY_ORDER.map((category) => {
            const tools = getLiveToolsByCategory(category);
            if (tools.length === 0) {
              return null;
            }

            return (
              <section key={category} id={category}>
                <div>
                  <p className="text-base font-bold text-[var(--color-text)]">{CATEGORIES[category].label}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-sub)]">{CATEGORIES[category].description}</p>
                </div>

                <div className="mt-5 grid auto-rows-fr gap-5 md:grid-cols-2">
                  {tools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      name={getToolHomeName(tool)}
                      catch={getToolHomeCatch(tool)}
                      description={getToolHomeDescription(tool)}
                      tags={tool.tags}
                      href={tool.id === "hensachi" ? "/hensachi?skip=1" : tool.path}
                      cta={tool.cta}
                      isNew={isToolNew(tool)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {guides.length > 0 ? (
        <section data-testid="home-guides" className="mt-12 border-t border-[color:var(--line)] pt-10">
          <SectionHeading
            title="悩み別のおすすめ順"
            description="全部やる前提ではなく、いまの悩みから必要な順に回れるようにしています。"
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                title={guide.title}
                description={guide.description}
                steps={guide.steps}
                note={guide.note}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section data-testid="home-aikata" className="mt-12 border-t border-[color:var(--line)] pt-10">
        <SectionHeading
          title="婚活診断LAB by アイカタ"
          description="婚活相談サービス「アイカタ」が運営する診断メディアです。"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm leading-8 text-[var(--color-text-sub)] sm:text-base">
              アイカタでは、診断結果をもとに、マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場まで含めて、
              自分に合う出会い方を一緒に設計します。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/consultation" className="btn-primary rounded-full px-5 py-3 text-sm font-bold">
                診断結果をもとに相談する
              </Link>
            </div>
          </div>

          <div className="grid gap-3 text-sm leading-7 text-[var(--color-text-sub)]">
            <p>
              <span className="font-bold text-[var(--color-text)]">普通の婚活に、自分を合わせなくていい。</span>
              いい相方に出会うには、自分に合う会い方がいる。
            </p>
            <p>
              <span className="font-bold text-[var(--color-text)]">診断は採点ではありません。</span>
              自分に合う出会い方を知るための入口です。
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
