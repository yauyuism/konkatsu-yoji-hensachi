"use client";

import Link from "next/link";

import { MoshConsultationCta } from "@/components/MoshConsultationCta";
import { ToolCard } from "@/components/ToolCard";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  getActiveAnnouncements,
  getToolHomeCatch,
  getToolHomeDescription,
  getToolHomeName,
  getLiveToolsByCategory,
  getToolById,
  getVisibleGuides,
  isToolNew,
  type Tool,
} from "@/data/tools";
import { trackEvent } from "@/lib/analytics";
import { MOSH_SERVICES_URL } from "@/lib/service-links";

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

const courseGuides = [
  {
    name: "会えるのに進まない人へ",
    description:
      "マチアプで会える。紹介もある。たまに悪くない人もいる。でも、なぜか好きになれない、会ったあとに疲れる。疲れている理由と、合う出会い方を順番に見直します。",
    steps: ["婚活疲れ・マチアプ疲れの理由診断", "あなたに合う出会い方診断", "個別相談"],
    cta: "会えるのに進まない理由を診断する",
    href: "/diagnoses/konkatsu-fatigue",
  },
  {
    name: "マチアプ疲れを整理したい人へ",
    description:
      "会う前のメッセージがしんどい。会っても次につながらない。アプリを開くだけで疲れる。今の疲れが、数の問題なのか、出会い方の相性なのかを見直します。",
    steps: ["婚活疲れ・マチアプ疲れの理由診断", "あなたに合う出会い方診断", "個別相談"],
    cta: "マチアプ疲れを診断する",
    href: "/diagnoses/konkatsu-fatigue",
  },
  {
    name: "相談所に入る前に整理したい人へ",
    description: "マチアプで疲れたから、次は相談所。そう決める前に、自分に合う婚活の進め方を一度整理します。",
    steps: ["婚活疲れ・マチアプ疲れの理由診断", "あなたに合う出会い方診断", "婚活の見直し相談"],
    cta: "相談所前に診断する",
    href: "/diagnoses/konkatsu-fatigue",
  },
];

export function HomePageClient({ initialHasCompletedAnyTool: _initialHasCompletedAnyTool = false }: HomePageClientProps) {
  void _initialHasCompletedAnyTool;

  const announcements = getActiveAnnouncements();
  const guides = getVisibleGuides();
  const fatigueTool = getToolById("fatigueReason");
  const deaiFitTool = getToolById("deaiFit");
  const mainDiagnosisTools = [fatigueTool, deaiFitTool].filter((tool): tool is Tool => Boolean(tool));
  const heroHref = fatigueTool?.path ?? "/diagnoses/konkatsu-fatigue";
  const handleHeroStartClick = () => {
    trackEvent("top_hero_start_diagnosis_click", {
      placement: "home_hero",
      quiz_name: "婚活疲れ・マチアプ疲れの理由診断",
    });
  };
  const handleHeroConsultationClick = () => {
    trackEvent("top_hero_consultation_click", {
      placement: "home_hero",
      cta_kind: "consultation",
    });
  };
  const handleFeaturedDiagnosisClick = (tool: Tool, placement: string) => {
    trackEvent("featured_diagnosis_click", {
      placement,
      quiz_name: tool.name,
    });
  };
  const handleCourseClick = (courseName: string) => {
    trackEvent("course_cta_click", {
      placement: "home_course",
      course_name: courseName,
    });
  };

  return (
    <section data-testid="home-page" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <header className="max-w-4xl">
        <h1
          data-testid="home-hero-heading"
          className="text-[2.35rem] font-black leading-tight tracking-[-0.03em] text-[var(--color-text)] sm:text-5xl lg:text-6xl"
        >
          婚活の違和感を、
          <span className="block text-[var(--color-main)]">診断で言語化する。</span>
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            data-testid="home-hero-cta"
            href={heroHref}
            onClick={handleHeroStartClick}
            className="btn-primary inline-flex rounded-full px-6 py-3.5 text-sm font-bold sm:text-[15px]"
          >
            無料診断をはじめる
          </Link>
          <a
            data-testid="home-hero-consultation-cta"
            href={MOSH_SERVICES_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleHeroConsultationClick}
            className="btn-secondary inline-flex rounded-full px-6 py-3.5 text-sm font-bold text-[var(--color-main)] sm:text-[15px]"
          >
            個別相談を見る
          </a>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-sub)] sm:text-lg">
          マチアプで会える。紹介もある。たまに悪くない人もいる。
          でも、なぜか進まない。その理由を、無料診断で整理できます。
          <br className="hidden sm:block" />
          プロフィール、LINE、条件、出会い方、婚活疲れ。まずは診断で自分の状態を見て、必要なら個別相談で一緒に見直します。
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

      {mainDiagnosisTools.length > 0 ? (
        <section data-testid="home-main-diagnoses" className="mt-12 border-t border-[color:var(--line)] pt-10">
          <SectionHeading
            title="まずはこの2つ"
            description="今しんどい理由を知りたい人は婚活疲れ診断へ。次にどこで出会えばいいか知りたい人は出会い方診断へ。どちらも採点ではなく、合わない頑張り方を減らすための診断です。"
          />
          <div className="mt-6 grid auto-rows-fr gap-5 md:grid-cols-2">
            {mainDiagnosisTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                name={tool.name}
                catch={index === 0 ? "今しんどい理由を知りたい人向け" : "次にどこで出会えばいいか知りたい人向け"}
                description={
                  index === 0
                    ? "会えるのに進まない理由を、現場の声からタイプ別に整理します。"
                    : "マチアプ、相談所、紹介、SNS、外飲み。あなたの恋愛が進みやすい出会い方を16タイプで診断します。"
                }
                tags={tool.tags}
                href={tool.path}
                cta={index === 0 ? "疲れている理由を診断する" : "合う出会い方を診断する"}
                isNew={isToolNew(tool)}
                highlightBadge={index === 0 ? "今しんどい人へ" : "次の出会い方へ"}
                onClick={() => handleFeaturedDiagnosisClick(tool, "home_main_diagnoses")}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section data-testid="home-course-guides" className="mt-12 border-t border-[color:var(--line)] pt-10">
        <SectionHeading
          title="どこから診断する？"
          description="単発で遊んでも大丈夫です。迷う人は、今の悩みに近いコースから順番に回ると、自分の状態と次の動き方が見えやすくなります。"
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {courseGuides.map((course) => (
            <article key={course.name} className="card flex h-full flex-col p-6 sm:p-7">
              <h3 className="text-lg font-black leading-tight text-[var(--color-text)]">{course.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-sub)]">{course.description}</p>
              <ol className="mt-5 grid gap-3">
                {course.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-7 text-[var(--color-text)]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-numeric text-xs font-black text-[var(--accent)]">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <Link
                href={course.href}
                onClick={() => handleCourseClick(course.name)}
                className="text-link mt-auto inline-flex pt-5"
              >
                {course.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

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

      <section data-testid="home-consultation" className="mt-12 border-t border-[color:var(--line)] pt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <SectionHeading
              title="診断で分かった違和感を、個別に整理したい人へ。"
              description="診断だけでは分かりきらないこともあります。今の出会い方を続けるべきか。プロフィールを変えるべきか。相談所に入る前に整理したほうがいいのか。個別に見たい人は、やうゆ式の婚活の見直し相談で一緒に話せます。"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="tag">あなたと合う人に届くプロフィール添削</span>
              <span className="tag">やうゆ式 婚活の見直し相談 60分</span>
              <span className="tag">やうゆ式 婚活の見直し相談 2回セット</span>
            </div>
          </div>
          <MoshConsultationCta placement="home_bottom" ctaKind="consultation" variant="compact" />
        </div>
      </section>
    </section>
  );
}
