"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { FatigueReasonRadarChart } from "@/components/fatigue-reason/FatigueReasonRadarChart";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import {
  FATIGUE_ANSWER_OPTIONS,
  FATIGUE_REASON_ACTION_GUIDES,
  FATIGUE_REASON_QUESTIONS,
  FATIGUE_REASON_TYPE_ORDER,
  buildFatigueReasonDiagnosisFromResultType,
  runFatigueReasonDiagnosis,
  type FatigueReasonFactor,
  type FatigueReasonType,
  type FatigueAnswerValue,
} from "@/lib/fatigue-reason";
import { FATIGUE_REASON_DISPLAY_META } from "@/lib/fatigue-reason-display";
import { getFatigueReasonXShareUrl } from "@/lib/fatigue-reason-share";
import { downloadResultImage } from "@/lib/result-image";
import { MOSH_SERVICES_URL } from "@/lib/service-links";

type FatigueReasonStage = "intro" | "question" | "result";

const analyzingDelayMs = 180;
const factorRankLabels = ["一番の原因", "二番目のストレス", "見落としがちな癖"] as const;
const compactFactorRankLabels = ["一番の原因", "二番目のストレス", "疲れグセ"] as const;
const conditionThreshold = 70;

function ResultList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid gap-3">
      {items.map((item) => (
        <li key={item} className="rounded-[1rem] bg-white/84 px-4 py-3 text-sm leading-7 text-[var(--color-text)]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function mergeGuideItems(factors: FatigueReasonFactor[], key: "suitedMeetings" | "drainingMeetings") {
  return Array.from(new Set(factors.flatMap((factor) => FATIGUE_REASON_ACTION_GUIDES[factor.type][key])));
}

function getFactorScore(factor: FatigueReasonFactor) {
  return Math.round(factor.normalizedScore * 100);
}

function getFactorScoreText(factor: FatigueReasonFactor) {
  return String(getFactorScore(factor));
}

function sanitizeFileNamePart(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_").slice(0, 40) || "result";
}

function FactorCard({ factor, index }: { factor: FatigueReasonFactor; index: number }) {
  const meta = FATIGUE_REASON_DISPLAY_META[factor.type];
  const isPrimary = index === 0;

  return (
    <article
      className={`rounded-[1.25rem] border p-5 ${
        isPrimary
          ? "border-[rgba(201,130,120,0.26)] bg-[linear-gradient(135deg,rgba(255,245,240,0.95),rgba(255,255,255,0.92))] shadow-[0_18px_40px_rgba(120,88,70,0.12)]"
          : "border-[var(--line)] bg-white/86"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">{factorRankLabels[index] ?? "高く出た傾向"}</p>
          <h3 className="mt-2 text-xl font-black leading-tight text-[var(--text-main)]">{meta.shortLabel}</h3>
          <p className="mt-1 text-sm font-bold leading-6 text-[var(--text-main)]">{meta.supportLabel}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 font-numeric text-sm font-black text-[var(--accent)]">
          {getFactorScoreText(factor)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{meta.formalDescription}</p>
    </article>
  );
}

function TopFactorBars({ factors }: { factors: FatigueReasonFactor[] }) {
  return (
    <section data-testid="fatigue-reason-breakdown" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">今のしんどさの内訳</h2>
      <div className="mt-5 grid gap-4">
        {factors.map((factor, index) => {
          const score = getFactorScore(factor);
          const width = Math.max(score, 6);

          return (
            <div key={factor.type} className="grid gap-2">
              <div className="flex items-center justify-between gap-4 text-sm font-black text-[var(--text-main)]">
                <span>
                  {factorRankLabels[index] ?? "高く出た傾向"}：{FATIGUE_REASON_DISPLAY_META[factor.type].shortLabel}
                </span>
                <span className="font-numeric shrink-0 text-sm text-[var(--accent)]">{getFactorScoreText(factor)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
                <div
                  className={`h-full rounded-full ${index === 0 ? "bg-[var(--accent)]" : "bg-[rgba(201,130,120,0.42)]"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FatigueConsultationCta({
  onClick,
}: {
  onClick: (placement: string) => void;
}) {
  return (
    <section
      data-testid="fatigue-reason-consultation-cta"
      className="soft-panel rounded-[1.4rem] border border-[rgba(201,130,120,0.22)] bg-[linear-gradient(135deg,rgba(255,247,242,0.94),rgba(255,255,255,0.9))] p-5 sm:p-6"
    >
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">CONSULTATION</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">この結果、もう少し個別に見たい人へ</h2>
      <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        診断では大まかな傾向が分かります。ただ、実際にはプロフィール、使っているアプリ、会ってきた相手、LINE、相談所に入るかどうかまで見ると、婚活でどこに疲れているかはもっと具体的に整理できます。
      </p>
      <a
        href={MOSH_SERVICES_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onClick("fatigue_reason_main_consultation")}
        className="btn-primary mt-5 inline-flex min-h-12 rounded-full px-6 py-3.5 text-sm font-black"
      >
        婚活の見直し相談を見る
      </a>
    </section>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">{title}</h2>
      {children}
    </section>
  );
}

function FatigueMapSection({ chartData }: { chartData: Array<{ label: string; score: number }> }) {
  return (
    <section data-testid="fatigue-reason-map" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">FATIGUE MAP</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">詳しい婚活疲れマップ</h2>
        </div>
        <p className="text-sm leading-7 text-[var(--text-sub)] sm:max-w-sm">
          しんどさがどこに出ているかを見るための地図です。点数より、形と偏りを見てください。
        </p>
      </div>
      <div data-testid="fatigue-reason-radar" className="mx-auto mt-5 max-w-[330px]">
        <FatigueReasonRadarChart data={chartData} height={260} />
      </div>
    </section>
  );
}

function ConditionCard({ factor }: { factor: FatigueReasonFactor }) {
  const meta = FATIGUE_REASON_DISPLAY_META[factor.type];

  return (
    <section data-testid="fatigue-reason-condition" className="soft-panel rounded-[1.4rem] border border-[rgba(143,183,161,0.2)] bg-[rgba(244,251,246,0.72)] p-5 sm:p-6">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">CONDITION</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">今のコンディション</h2>
      <div className="mt-4 rounded-[1.2rem] bg-white/78 px-4 py-4">
        <h3 className="text-xl font-black leading-tight text-[var(--text-main)]">立て直しサインが出ています</h3>
        <p className="mt-2 text-sm font-bold leading-7 text-[var(--accent)]">{meta.supportLabel}</p>
        <p className="mt-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
          新しい出会いを増やす前に、一度婚活で削れた自分を整えたほうがよい状態です。
          今は「もっと会う」より、プロフィール・会う基準・出会い方を見直すタイミングかもしれません。
        </p>
        <p className="mt-3 rounded-[1rem] bg-white/86 px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
          無理に予定を増やすより、今の婚活がどこでしんどくなっているかを整理するのがおすすめです。
        </p>
      </div>
    </section>
  );
}

function LowSignalSection() {
  return (
    <section data-testid="fatigue-reason-low-signal" className="soft-panel rounded-[1.4rem] border border-[rgba(143,183,161,0.2)] bg-[rgba(244,251,246,0.72)] p-5 sm:p-6">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">LOW SIGNAL</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">大きく出た原因はありません</h2>
      <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        今回の回答では、特定の婚活疲れ原因が強く出ている状態ではありませんでした。
        無理に原因を探すより、会った後に軽いか疲れるか、小さな違和感だけメモしておくのがおすすめです。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="tag">大きな原因は薄め</span>
        <span className="tag">今のペースを守る</span>
        <span className="tag">違和感を早めにメモ</span>
      </div>
    </section>
  );
}

function DetailedFactorCard({ factor, index }: { factor: FatigueReasonFactor; index: number }) {
  const meta = FATIGUE_REASON_DISPLAY_META[factor.type];
  const guide = FATIGUE_REASON_ACTION_GUIDES[factor.type];

  return (
    <article className="rounded-[1.2rem] border border-[var(--line)] bg-white/82 p-5">
      <p className="text-xs font-black tracking-[0.16em] text-[var(--accent)]">{factorRankLabels[index] ?? "高く出た傾向"}</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-[var(--text-main)]">{meta.resultLabel}</h3>
      <p className="mt-1 text-sm font-bold leading-7 text-[var(--text-main)]">{meta.supportLabel}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{meta.formalDescription}</p>
      <ul className="mt-4 grid gap-2">
        {guide.reviewActions.slice(0, 2).map((item) => (
          <li key={item} className="rounded-[0.9rem] bg-white/84 px-4 py-3 text-sm leading-7 text-[var(--color-text)]">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function DetailedConditionCard() {
  const meta = FATIGUE_REASON_DISPLAY_META.reset;

  return (
    <article className="rounded-[1.2rem] border border-[rgba(143,183,161,0.22)] bg-[rgba(244,251,246,0.74)] p-5">
      <p className="text-xs font-black tracking-[0.16em] text-[var(--accent)]">今のコンディション</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-[var(--text-main)]">{meta.resultLabel}</h3>
      <p className="mt-1 text-sm font-bold leading-7 text-[var(--text-main)]">{meta.supportLabel}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{meta.formalDescription}</p>
    </article>
  );
}

function DetailedExplanationSection({
  factors,
  showCondition,
}: {
  factors: FatigueReasonFactor[];
  showCondition: boolean;
}) {
  return (
    <section data-testid="fatigue-reason-details" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">詳細説明</h2>
      <div className="mt-5 grid gap-4">
        {factors.map((factor, index) => (
          <DetailedFactorCard key={factor.type} factor={factor} index={index} />
        ))}
        {showCondition ? <DetailedConditionCard /> : null}
      </div>
    </section>
  );
}

function FatigueSimpleResultCard({
  resultLabel,
  supportLabel,
  shortCopy,
  tags,
}: {
  resultLabel: string;
  supportLabel: string;
  shortCopy: string;
  tags: Array<{ label: string; value: string }>;
}) {
  return (
    <article
      data-testid="fatigue-reason-share-card"
      className="card overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#fffaf6_0%,#ffffff_56%,#f4fbf6_100%)] p-5 sm:p-8"
    >
      <div>
        <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">婚活疲れ・マチアプ疲れ診断</p>
        <p className="mt-5 text-sm font-bold leading-7 text-[var(--text-sub)]">あなたは</p>
        <h1 className="mt-1 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-6xl">{resultLabel}</h1>
        <p className="mt-3 text-sm font-black leading-7 text-[var(--text-main)] sm:text-base">{supportLabel}</p>
        <p className="mt-5 text-xs font-black tracking-[0.16em] text-[var(--accent)]">一言診断</p>
        <p className="mt-3 max-w-2xl text-base font-bold leading-8 text-[var(--text-main)] sm:text-lg">{shortCopy}</p>
        <div className="mt-6 grid gap-2">
          {tags.map((tag) => (
            <p key={`${tag.label}-${tag.value}`} className="rounded-[1rem] bg-white/78 px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
              <span className="text-[var(--accent)]">{tag.label}：</span>
              {tag.value}
            </p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-black tracking-[0.14em] text-[var(--text-sub)]">
          <span>shindanlab.jp</span>
          <span>やうゆ式</span>
        </div>
      </div>
    </article>
  );
}

function FatigueShareActions({
  xShareUrl,
  isSavingShareImage,
  shareImageError,
  onSaveImage,
  onXShareClick,
  onConsultationClick,
}: {
  xShareUrl: string;
  isSavingShareImage: boolean;
  shareImageError: string | null;
  onSaveImage: () => void;
  onXShareClick: () => void;
  onConsultationClick: () => void;
}) {
  return (
    <section data-testid="fatigue-reason-share-actions" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <button
          data-testid="fatigue-reason-save-card"
          type="button"
          onClick={onSaveImage}
          disabled={isSavingShareImage}
          className="btn-primary inline-flex min-h-12 justify-center rounded-full px-6 py-3.5 text-sm font-black disabled:cursor-wait disabled:opacity-70"
        >
          {isSavingShareImage ? "画像を保存しています..." : "画像を保存してシェア"}
        </button>
        <a
          data-testid="fatigue-reason-consultation-quick"
          href={MOSH_SERVICES_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConsultationClick}
          className="btn-secondary inline-flex min-h-12 justify-center rounded-full px-6 py-3.5 text-sm font-black text-[var(--color-main)]"
        >
          個別に相談する
        </a>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">
        画像つきでXに載せたい人は、結果カードを保存して投稿に添付してください。
      </p>
      <a
        data-testid="fatigue-reason-share-x-top"
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onXShareClick}
        className="text-link mt-2 inline-flex text-sm font-bold"
      >
        Xで文章だけシェア
      </a>
      {shareImageError ? (
        <p data-testid="fatigue-reason-save-card-error" className="mt-3 text-sm font-bold leading-7 text-[var(--accent)]">
          {shareImageError}
        </p>
      ) : null}
    </section>
  );
}

function FatigueReasonSummary({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section data-testid="fatigue-reason-summary" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">なぜ疲れているのか</h2>
      <div className="mt-4 grid gap-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function FatigueFirstActions({ actions }: { actions: string[] }) {
  return (
    <section data-testid="fatigue-reason-first-actions" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">まず見直すこと</h2>
      <ul className="mt-4 grid gap-3">
        {actions.slice(0, 3).map((action) => (
          <li key={action} className="rounded-[1rem] bg-white/84 px-4 py-3 text-sm font-bold leading-7 text-[var(--color-text)]">
            {action}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedDiagnosisCard({
  href,
  title,
  body,
  onClick,
}: {
  href: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="rounded-[1.2rem] border border-[var(--line)] bg-white/86 p-5 transition hover:-translate-y-0.5 hover:border-[rgba(201,130,120,0.34)]">
      <h3 className="text-base font-black leading-7 text-[var(--text-main)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{body}</p>
      <span className="text-link mt-4 inline-flex">やってみる →</span>
    </Link>
  );
}

export function FatigueReasonApp({ initialResultType = null }: { initialResultType?: FatigueReasonType | null }) {
  const [stage, setStage] = useState<FatigueReasonStage>(initialResultType ? "result" : "intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FatigueAnswerValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<FatigueAnswerValue | null>(null);
  const [isSavingShareImage, setIsSavingShareImage] = useState(false);
  const [shareImageError, setShareImageError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const diagnosis = useMemo(() => {
    if (initialResultType && answers.length === 0) {
      return buildFatigueReasonDiagnosisFromResultType(initialResultType);
    }

    return runFatigueReasonDiagnosis(answers);
  }, [answers, initialResultType]);
  const question = FATIGUE_REASON_QUESTIONS[questionIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIndex, stage]);

  useEffect(() => {
    if (stage !== "result") {
      return;
    }

    markToolCompleted("fatigueReason");
    trackEvent("result_view", {
      quiz_name: "fatigue_reason",
      result_type: diagnosis.result.type,
      result_name: diagnosis.result.name,
    });
    trackEvent("radar_chart_view", {
      quiz_name: "fatigue_reason",
      result_type: diagnosis.result.type,
    });
  }, [diagnosis.result.name, diagnosis.result.type, stage]);

  const handleStart = () => {
    trackEvent("diagnosis_start", {
      quiz_name: "fatigue_reason",
    });
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedValue(null);
    setStage("question");
  };

  const handleRestart = () => {
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedValue(null);
    setStage("intro");
  };

  const handleBack = () => {
    if (selectedValue !== null || questionIndex === 0) {
      return;
    }

    setAnswers((current) => current.slice(0, -1));
    setQuestionIndex((current) => current - 1);
  };

  const handleSelect = (value: FatigueAnswerValue) => {
    if (selectedValue !== null) {
      return;
    }

    const nextAnswers = [...answers, value];
    setSelectedValue(value);

    trackEvent("question_answered", {
      quiz_name: "fatigue_reason",
      question_id: question.id,
      answer_value: value,
      progress: questionIndex + 1,
    });

    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelectedValue(null);

      if (questionIndex === FATIGUE_REASON_QUESTIONS.length - 1) {
        const completed = runFatigueReasonDiagnosis(nextAnswers);
        trackEvent("diagnosis_complete", {
          quiz_name: "fatigue_reason",
          result_type: completed.result.type,
          result_name: completed.result.name,
        });
        setStage("result");
        return;
      }

      setQuestionIndex((current) => current + 1);
    }, analyzingDelayMs);
  };

  if (stage === "intro") {
    return (
      <section data-testid="fatigue-reason-intro" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
            FREE DIAGNOSIS
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
            婚活疲れ・マチアプ疲れの理由診断
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-8 text-[var(--text-main)] sm:text-base">
            会えるのに進まない理由を、現場の声からタイプ別に整理します。
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
            マチアプで会える。紹介もある。たまに悪くない人もいる。
            でも、なぜか好きになれない、会ったあとに疲れる、次に進める理由が見つからない。
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
            婚活がしんどいのは、あなたの性格や努力不足だけが理由ではありません。
            今の出会い方、プロフィール、相手の選び方、判断のタイミングが合っていないだけかもしれません。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="tag">全20問</span>
            <span className="tag">約3〜4分</span>
            <span className="tag">無料</span>
            <span className="tag">婚活疲れを整理</span>
          </div>
          <button
            type="button"
            onClick={handleStart}
            data-testid="fatigue-reason-start"
            className="btn-primary mt-8 rounded-full px-7 py-4 text-sm font-black"
          >
            診断を始める
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">この診断で分かること</p>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              速すぎる判断、合わない人の流入、条件検索の疲れ、場所のズレなど、今の婚活でどこがしんどくなっているかを8タイプで返します。
            </p>
          </section>
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">結果の使い方</p>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              診断は採点ではありません。自分を責めるためではなく、合っていない頑張り方を見直すためのメモとして使ってください。
            </p>
          </section>
        </div>
      </section>
    );
  }

  if (stage === "question") {
    const progress = ((questionIndex + 1) / FATIGUE_REASON_QUESTIONS.length) * 100;

    return (
      <section data-testid="fatigue-reason-question" className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={questionIndex === 0 || selectedValue !== null}
              className="text-link disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
            >
              ← 前の質問
            </button>
            <p className="text-sm font-bold tracking-[0.12em] text-[var(--color-text-sub)]">
              {questionIndex + 1} / {FATIGUE_REASON_QUESTIONS.length}
            </p>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
            <div className="h-full rounded-full bg-[var(--color-main)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>

          <article className="card mt-8 p-6 sm:p-8">
            <p className="text-sm font-bold tracking-[0.14em] text-[var(--color-text-sub)]">QUESTION {questionIndex + 1}</p>
            <h1 className="mt-4 text-[1.5rem] font-black leading-[1.65] text-[var(--color-text)] sm:text-[2rem]">
              {question.text}
            </h1>
            <div className="mt-7 grid gap-3">
              {FATIGUE_ANSWER_OPTIONS.map((option) => {
                const isSelected = selectedValue === option.value;

                return (
                  <button
                    key={`${question.id}-${option.value}`}
                    type="button"
                    data-answer-value={option.value}
                    onClick={() => handleSelect(option.value)}
                    disabled={selectedValue !== null}
                    className={`fatigue-answer choice-button rounded-[1.1rem] border px-4 py-4 text-left text-sm font-bold leading-7 transition sm:text-base ${
                      isSelected
                        ? "border-[rgba(201,130,120,0.36)] bg-[rgba(201,130,120,0.08)] text-[var(--accent)]"
                        : "border-[rgba(63,52,46,0.1)] bg-white/88 text-[var(--text-main)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    );
  }

  const { result, normalizedScores, rankedFactors, topFactors, conditionFactor } = diagnosis;
  const isLowSignal = result.type === "lowSignal";
  const primaryFactor = topFactors[0];

  if (!primaryFactor) {
    return null;
  }

  const primaryGuide = FATIGUE_REASON_ACTION_GUIDES[result.type];
  const suitedMeetings = isLowSignal ? primaryGuide.suitedMeetings : mergeGuideItems(topFactors.slice(0, 2), "suitedMeetings");
  const drainingMeetings = isLowSignal ? primaryGuide.drainingMeetings : mergeGuideItems(topFactors.slice(0, 2), "drainingMeetings");
  const resultMeta = FATIGUE_REASON_DISPLAY_META[result.type];
  const showCondition = !isLowSignal && conditionFactor ? getFactorScore(conditionFactor) >= conditionThreshold : false;
  const chartData = FATIGUE_REASON_TYPE_ORDER.map((type) => ({
    label: FATIGUE_REASON_DISPLAY_META[type].chartLabel,
    score: Math.round(normalizedScores[type] * 100),
  }));
  const shareTopLabels = isLowSignal
    ? ["大きな原因は薄め", "今のペースを守る", "違和感を早めにメモ"]
    : topFactors.map((factor) => FATIGUE_REASON_DISPLAY_META[factor.type].shortLabel);
  const xShareUrl = getFatigueReasonXShareUrl({
    resultLabel: resultMeta.resultLabel,
    shortCopy: resultMeta.shareCopy,
  });
  const resultTags = isLowSignal
    ? [
        { label: "状態", value: "大きな原因は薄め" },
        { label: "次の見方", value: "今のペースを守る" },
        { label: "メモ", value: "違和感を早めにメモ" },
      ]
    : topFactors.map((factor, index) => ({
        label: compactFactorRankLabels[index] ?? factorRankLabels[index],
        value: FATIGUE_REASON_DISPLAY_META[factor.type].shortLabel,
      }));
  const reasonSummaryParagraphs = isLowSignal
    ? [
        "今回の回答では、婚活疲れの原因がどこか一箇所に強く偏っている状態ではありませんでした。",
        "ただ、疲れていないと決めつけるより、会った後に軽いか疲れるかを見ておくと、小さな違和感を早めに拾いやすくなります。",
      ]
    : [
        FATIGUE_REASON_DISPLAY_META[primaryFactor.type].formalDescription,
        resultMeta.shareCopy,
        topFactors[1]
          ? `さらに「${FATIGUE_REASON_DISPLAY_META[topFactors[1].type].shortLabel}」も重なると、今の婚活のしんどさが増えやすくなります。`
          : "出会いの数を増やすより、まず今の進め方が自分に合っているかを見るのがよさそうです。",
      ];
  const firstActions = primaryGuide.reviewActions.slice(0, 3);
  const relatedDiagnoses = [
    {
      href: "/diagnoses/deai-fit",
      title: "あなたに合う出会い方診断",
      body: "マチアプ、相談所、紹介、SNS、外飲みのどこが合いやすいかを16タイプで見ます。",
    },
    {
      href: "/prof",
      title: "プロフィール偏差値診断",
      body: "合わない人が入りやすい人は、プロフィールの届き方を見直すと入口が変わります。",
    },
    {
      href: "/weight",
      title: "LINEの重さ測定",
      body: "会う前後のやり取りで疲れやすい人は、メッセージの重さも見ておくと整理しやすいです。",
    },
  ];

  const handleXShareClick = (placement: "result_hero" | "share_card") => {
    trackEvent("fatigue_result_share_x_click", {
      placement: "fatigue_result",
      primary_type: resultMeta.resultLabel,
      top_labels: shareTopLabels,
    });
    trackEvent("share_button_click", {
      platform: "x",
      placement,
      quiz_name: "fatigue_reason",
      result_type: result.type,
    });
    trackEvent("x_share_click", {
      placement,
      quiz_name: "fatigue_reason",
      result_type: result.type,
    });
  };

  const handleSaveShareImage = async () => {
    if (!shareCardRef.current || isSavingShareImage) {
      return;
    }

    setShareImageError(null);
    setIsSavingShareImage(true);

    try {
      trackEvent("fatigue_result_save_image_click", {
        placement: "fatigue_result",
        primary_type: resultMeta.resultLabel,
        top_labels: shareTopLabels,
      });
      trackEvent("save_image_click", {
        placement: "share_card",
        quiz_name: "fatigue_reason",
        result_type: result.type,
      });

      await downloadResultImage(shareCardRef.current, `婚活疲れ診断_${sanitizeFileNamePart(resultMeta.resultLabel)}.png`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error";

      setShareImageError("保存できなかったため、スクショで保存してください。");
      trackEvent("fatigue_result_save_image_error", {
        placement: "fatigue_result",
        primary_type: resultMeta.resultLabel,
        error_message: errorMessage,
      });
    } finally {
      setIsSavingShareImage(false);
    }
  };

  const handleConsultationClick = (placement: string) => {
    trackEvent("consultation_cta_click", {
      placement,
      quiz_name: "fatigue_reason",
      result_type: result.type,
      cta_kind: "fatigue_review_consultation",
    });
  };

  const handleRelatedDiagnosisClick = (title: string) => {
    trackEvent("related_diagnosis_click", {
      placement: "fatigue_reason_result",
      quiz_name: "fatigue_reason",
      result_type: result.type,
      related_title: title,
    });
  };

  return (
    <section data-testid="fatigue-reason-result" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-4xl">
        <div data-testid="fatigue-reason-result-hero" ref={shareCardRef}>
          <FatigueSimpleResultCard
            resultLabel={resultMeta.resultLabel}
            supportLabel={resultMeta.supportLabel}
            shortCopy={resultMeta.shareCopy}
            tags={resultTags}
          />
        </div>

        <div className="mt-5 grid gap-4">
          <FatigueShareActions
            xShareUrl={xShareUrl}
            isSavingShareImage={isSavingShareImage}
            shareImageError={shareImageError}
            onSaveImage={handleSaveShareImage}
            onXShareClick={() => handleXShareClick("result_hero")}
            onConsultationClick={() => handleConsultationClick("fatigue_reason_quick_action")}
          />

          <FatigueReasonSummary paragraphs={reasonSummaryParagraphs} />

          <FatigueFirstActions actions={firstActions} />

          <FatigueConsultationCta onClick={handleConsultationClick} />

          <details data-testid="fatigue-reason-detailed-result" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
            <summary className="cursor-pointer text-base font-black leading-7 text-[var(--color-text)]">
              詳しい診断結果を見る
            </summary>
            <div className="mt-5 grid gap-4">
              <FatigueMapSection chartData={chartData} />

              {isLowSignal ? (
                <LowSignalSection />
              ) : (
                <>
                  <TopFactorBars factors={topFactors} />

                  <section data-testid="fatigue-reason-top-factors" className="grid gap-4 lg:grid-cols-3">
                    {topFactors.map((factor, index) => (
                      <FactorCard key={factor.type} factor={factor} index={index} />
                    ))}
                  </section>

                  {showCondition && conditionFactor ? <ConditionCard factor={conditionFactor} /> : null}

                  <DetailedExplanationSection factors={topFactors} showCondition={showCondition} />
                </>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <ResultSection title="合いやすい出会い方">
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suitedMeetings.map((hint) => (
                      <span key={hint} className="tag">
                        {hint}
                      </span>
                    ))}
                  </div>
                </ResultSection>

                <ResultSection title="主戦場にしすぎると疲れやすい出会い方">
                  <ResultList items={drainingMeetings} />
                </ResultSection>

                <ResultSection title="おすすめの次の一歩">
                  <p className="mt-4 text-sm font-bold leading-8 text-[var(--color-text)] sm:text-base">{result.nextStep}</p>
                </ResultSection>
              </div>

              {!isLowSignal ? (
                <section data-testid="fatigue-reason-reference-scores" className="rounded-[1.2rem] border border-[var(--line)] bg-white/78 p-5">
                  <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">参考メモ</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
                    結果本文では、点数ではなく上位の原因と今のコンディションから見立てています。
                  </p>
                  <div className="mt-4 grid gap-3">
                    {rankedFactors.map((factor) => (
                      <div key={factor.type} className="grid grid-cols-[minmax(5.5rem,8rem)_1fr_minmax(5.5rem,8rem)] items-center gap-3 text-sm">
                        <span className="text-xs font-bold leading-5 text-[var(--text-main)] sm:text-sm">{FATIGUE_REASON_DISPLAY_META[factor.type].shortLabel}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
                          <span
                            className="block h-full rounded-full bg-[var(--color-main)]"
                            style={{ width: `${Math.round(normalizedScores[factor.type] * 100)}%` }}
                          />
                        </span>
                        <span className="font-numeric text-right text-xs font-black text-[var(--text-main)]">{getFactorScoreText(factor)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section data-testid="fatigue-reason-related" className="rounded-[1.2rem] border border-[var(--line)] bg-white/78 p-5">
                <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">次におすすめの診断</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {relatedDiagnoses.map((diagnosisItem) => (
                    <RelatedDiagnosisCard
                      key={diagnosisItem.href}
                      href={diagnosisItem.href}
                      title={diagnosisItem.title}
                      body={diagnosisItem.body}
                      onClick={() => handleRelatedDiagnosisClick(diagnosisItem.title)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </details>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={handleRestart} className="btn-secondary rounded-[1rem] px-5 py-3 text-sm font-bold">
            もう一度診断する
          </button>
        </div>
      </div>
    </section>
  );
}
