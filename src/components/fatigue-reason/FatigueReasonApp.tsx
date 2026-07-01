"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

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
import { getFatigueReasonResultUrl, getFatigueReasonXShareUrl } from "@/lib/fatigue-reason-share";
import { downloadResultImage } from "@/lib/result-image";
import { CONSULTATION_STORE_URL } from "@/lib/service-links";

type FatigueReasonStage = "intro" | "question" | "result";

const analyzingDelayMs = 180;
const factorRankLabels = ["一番の原因", "二番目のストレス", "見落としがちな癖"] as const;
const compactFactorRankLabels = ["一番の原因", "二番目のストレス", "疲れグセ"] as const;
const conditionThreshold = 70;

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

function buildReviewAnalysis({
  isLowSignal,
  primaryFactor,
  secondaryFactor,
  primaryGuide,
}: {
  isLowSignal: boolean;
  primaryFactor: FatigueReasonFactor;
  secondaryFactor?: FatigueReasonFactor;
  primaryGuide: (typeof FATIGUE_REASON_ACTION_GUIDES)[FatigueReasonType];
}) {
  if (isLowSignal) {
    return [
      "今は大きな原因を無理に探すより、会った後の体感を細かく見る段階です。",
      "楽しかったかより、帰り道に軽いか、次の予定を考えたときに身体が重くならないかを観察すると、小さなズレを早めに拾えます。",
      "疲れが強くなる前に、会う基準と連絡頻度だけ軽く整えるのがおすすめです。",
    ];
  }

  const primaryMeta = FATIGUE_REASON_DISPLAY_META[primaryFactor.type];
  const secondaryMeta = secondaryFactor ? FATIGUE_REASON_DISPLAY_META[secondaryFactor.type] : null;
  const secondarySentence = secondaryMeta
    ? `そこに「${secondaryMeta.shortLabel}」も重なると、相手そのものより、選ぶ前提や進め方で消耗しやすくなります。`
    : "相手を増やすほど情報量が増え、判断の負荷だけが先に大きくなりやすい状態です。";

  return [
    `見直すべきなのは、出会いの数より「${primaryMeta.shortLabel}」が起きる場面です。${primaryGuide.shortReason}`,
    secondarySentence,
    `まずは「${primaryGuide.reviewActions[0]}」を試すと、どこで疲れが発生しているかを切り分けやすくなります。`,
  ];
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
  onClick: () => void;
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
      <p className="mt-3 rounded-[1rem] bg-white/78 px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
        婚活をもっと頑張らせる相談ではなく、合っていない頑張り方をやめるための相談です。
      </p>
      <a
        href={CONSULTATION_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
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
  cardRef,
  resultLabel,
  supportLabel,
  oneLineSummary,
  tags,
  chartData,
}: {
  cardRef: RefObject<HTMLElement>;
  resultLabel: string;
  supportLabel: string;
  oneLineSummary: string;
  tags: Array<{ label: string; value: string }>;
  chartData: Array<{ label: string; score: number }>;
}) {
  return (
    <article
      ref={cardRef}
      data-testid="fatigue-reason-share-card"
      className="relative mx-auto flex min-h-[680px] w-full max-w-[440px] overflow-hidden rounded-[2rem] border border-[rgba(120,88,70,0.12)] bg-[linear-gradient(145deg,#fffdf9_0%,#fff8f2_46%,#f3fbf5_100%)] p-5 shadow-[0_24px_70px_rgba(90,64,48,0.18)] sm:min-h-[720px] sm:p-7"
    >
      <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-[rgba(201,130,120,0.2)] bg-white/76 px-3 py-1 text-[0.65rem] font-black tracking-[0.18em] text-[var(--accent)]">
        SHARE IMAGE
      </div>
      <div className="flex min-h-full w-full flex-col">
        <div>
          <p className="text-[0.72rem] font-black tracking-[0.18em] text-[var(--accent)]">婚活疲れ・マチアプ疲れ診断</p>
          <p className="mt-1 text-[0.68rem] font-black tracking-[0.18em] text-[var(--text-sub)]">RESULT CARD</p>
        </div>

        <div className="py-6 sm:py-8">
          <p className="text-base font-black leading-7 text-[var(--text-sub)]">あなたは</p>
          <h1 className="mt-2 text-[3.25rem] font-black leading-[0.98] text-[var(--text-main)] sm:text-[4.2rem]">{resultLabel}</h1>
          <p className="mt-4 text-base font-black leading-7 text-[var(--text-main)] sm:text-lg">{supportLabel}</p>
        </div>

        <div className="rounded-[1.25rem] border border-[rgba(201,130,120,0.12)] bg-white/76 px-4 py-4">
          <p className="text-[0.72rem] font-black tracking-[0.16em] text-[var(--accent)]">ひとことで言うと</p>
          <p className="mt-2 text-[0.95rem] font-bold leading-7 text-[var(--text-main)] sm:text-base">{oneLineSummary}</p>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <p
                key={`${tag.label}-${tag.value}`}
                className="rounded-full border border-[rgba(201,130,120,0.12)] bg-white/78 px-3 py-2 text-[0.78rem] font-black leading-6 text-[var(--text-main)]"
              >
                <span className="text-[var(--accent)]">{tag.label}：</span>
                {tag.value}
              </p>
            ))}
          </div>

          <div data-testid="fatigue-reason-card-map" className="mt-5 rounded-[1.25rem] border border-[rgba(201,130,120,0.1)] bg-white/54 px-3 py-3 opacity-75">
            <div className="mx-auto max-w-[220px]">
              <FatigueReasonRadarChart data={chartData} height={140} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-xs font-black tracking-[0.14em] text-[var(--text-sub)]">
            <span>shindanlab.jp</span>
            <span>やうゆ式</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function FatigueShareActions({
  isSavingImageOnly,
  xShareUrl,
  shareImageMessage,
  shareImageError,
  onShareResult,
  onSaveImageOnly,
  onConsultationClick,
}: {
  isSavingImageOnly: boolean;
  xShareUrl: string;
  shareImageMessage: string | null;
  shareImageError: string | null;
  onShareResult: () => void;
  onSaveImageOnly: () => void;
  onConsultationClick: () => void;
}) {
  return (
    <section data-testid="fatigue-reason-share-actions" className="mx-auto w-full max-w-[520px] rounded-[1.6rem] border border-[rgba(120,88,70,0.1)] bg-white/86 p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-black leading-tight text-[var(--text-main)]">結果をシェアする</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
          この結果はXでシェアできます。投稿すると、診断カードがリンク画像として表示されます。
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <a
          data-testid="fatigue-reason-share-x"
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onShareResult}
          className="btn-primary inline-flex min-h-14 w-full justify-center gap-2 rounded-full px-6 py-4 text-base font-black"
        >
          診断結果をXにシェア
        </a>
        {shareImageMessage ? (
          <p data-testid="fatigue-reason-save-card-success" className="rounded-[1rem] bg-[rgba(143,183,161,0.12)] px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
            {shareImageMessage}
          </p>
        ) : null}
        <a
          data-testid="fatigue-reason-consultation-quick"
          href={CONSULTATION_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConsultationClick}
          className="btn-secondary inline-flex min-h-14 w-full justify-center rounded-full border-[rgba(201,130,120,0.26)] bg-white px-6 py-4 text-base font-black text-[var(--color-main)]"
        >
          自分の場合を相談する
        </a>
        <button
          data-testid="fatigue-reason-save-image-only"
          type="button"
          onClick={onSaveImageOnly}
          disabled={isSavingImageOnly}
          className="text-link mx-auto inline-flex w-fit text-sm font-bold disabled:cursor-wait disabled:no-underline disabled:opacity-60"
        >
          {isSavingImageOnly ? "画像を作成しています..." : "画像だけ保存する"}
        </button>
      </div>
      <p className="mt-3 rounded-[1rem] bg-[rgba(255,245,240,0.72)] px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
        「当たってるかも」と思ったら、プロフィールや会ってきた相手まで含めて見ると、疲れている理由がもっと具体的になります。
      </p>
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

function MeetingFitSection({
  suitedMeetings,
  drainingMeetings,
}: {
  suitedMeetings: string[];
  drainingMeetings: string[];
}) {
  return (
    <section data-testid="fatigue-reason-meeting-fit" className="grid gap-4 lg:grid-cols-2">
      <ResultSection title="自分に合う出会い方">
        <div className="mt-4 flex flex-wrap gap-2">
          {suitedMeetings.map((hint) => (
            <span key={hint} className="tag">
              {hint}
            </span>
          ))}
        </div>
      </ResultSection>

      <ResultSection title="疲れやすい出会い方">
        <div className="mt-4 flex flex-wrap gap-2">
          {drainingMeetings.map((hint) => (
            <span key={hint} className="tag">
              {hint}
            </span>
          ))}
        </div>
      </ResultSection>
    </section>
  );
}

function FatigueReviewAnalysis({ analysis }: { analysis: string[] }) {
  return (
    <section data-testid="fatigue-reason-review-analysis" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">見直すこと</h2>
      <div className="mt-4 grid gap-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        {analysis.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
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

export function FatigueReasonApp({
  initialResultType = null,
  isShareResultPage = false,
}: {
  initialResultType?: FatigueReasonType | null;
  isShareResultPage?: boolean;
}) {
  const [stage, setStage] = useState<FatigueReasonStage>(initialResultType ? "result" : "intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FatigueAnswerValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<FatigueAnswerValue | null>(null);
  const [isSavingImageOnly, setIsSavingImageOnly] = useState(false);
  const [shareImageMessage, setShareImageMessage] = useState<string | null>(null);
  const [shareImageError, setShareImageError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLElement>(null);

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

    if (isShareResultPage) {
      trackEvent("fatigue_result_share_page_view", {
        result_type: FATIGUE_REASON_DISPLAY_META[diagnosis.result.type].resultLabel,
      });
    }
  }, [diagnosis.result.name, diagnosis.result.type, isShareResultPage, stage]);

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
  const resultShareUrl = getFatigueReasonResultUrl(result.type);
  const xShareUrl = getFatigueReasonXShareUrl({
    resultLabel: resultMeta.resultLabel,
    shortCopy: resultMeta.shareCopy,
    resultUrl: resultShareUrl,
  });
  const showCondition = !isLowSignal && conditionFactor ? getFactorScore(conditionFactor) >= conditionThreshold : false;
  const chartData = FATIGUE_REASON_TYPE_ORDER.map((type) => ({
    label: FATIGUE_REASON_DISPLAY_META[type].chartLabel,
    score: Math.round(normalizedScores[type] * 100),
  }));
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
    ? resultMeta.reasonParagraphs
    : [
        ...resultMeta.reasonParagraphs,
        topFactors[1]
          ? `さらに「${FATIGUE_REASON_DISPLAY_META[topFactors[1].type].shortLabel}」も重なると、相手そのものより、選ぶ前提や進め方でしんどさが増えやすくなります。`
          : "出会いの数を増やすより、まず今の進め方が自分に合っているかを見るのがよさそうです。",
      ];
  const reviewAnalysis = buildReviewAnalysis({
    isLowSignal,
    primaryFactor,
    secondaryFactor: topFactors[1],
    primaryGuide,
  });
  const relatedDiagnoses = [
    {
      href: "/diagnoses/deai-fit",
      title: "あなたに合う出会い方診断",
      body: "マチアプ、相談所、紹介、SNS、外飲みのどこが自分に合うかを16タイプで見ます。",
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

  const handleShareResult = () => {
    setShareImageError(null);
    setShareImageMessage(null);

    trackEvent("fatigue_result_share_x_click", {
      result_type: resultMeta.resultLabel,
      share_url: resultShareUrl,
    });
  };

  const handleSaveImageOnly = async () => {
    if (!shareCardRef.current || isSavingImageOnly) {
      return;
    }

    setShareImageError(null);
    setShareImageMessage(null);
    setIsSavingImageOnly(true);

    try {
      trackEvent("fatigue_result_save_image_click", {
        placement: "image_only",
        result_type: resultMeta.resultLabel,
      });

      await downloadResultImage(shareCardRef.current, `婚活疲れ診断_${sanitizeFileNamePart(resultMeta.resultLabel)}.png`);
      setShareImageMessage("結果カードを保存しました。");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error";

      setShareImageError("画像を作成できませんでした。スクショをご利用ください。");
      trackEvent("fatigue_result_save_image_error", {
        placement: "image_only",
        result_type: resultMeta.resultLabel,
        error_message: errorMessage,
      });
    } finally {
      setIsSavingImageOnly(false);
    }
  };

  const handleConsultationClick = (placement: string) => {
    trackEvent(placement === "consultation_block" ? "fatigue_result_consultation_cta_click" : "fatigue_result_consultation_click", {
      placement,
      result_type: resultMeta.resultLabel,
    });
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
        <div data-testid="fatigue-reason-result-hero">
          <FatigueSimpleResultCard
            cardRef={shareCardRef}
            resultLabel={resultMeta.resultLabel}
            supportLabel={resultMeta.supportLabel}
            oneLineSummary={resultMeta.shareCopy}
            tags={resultTags}
            chartData={chartData}
          />
        </div>

        <div className="mt-5 grid gap-4">
          <FatigueShareActions
            isSavingImageOnly={isSavingImageOnly}
            xShareUrl={xShareUrl}
            shareImageMessage={shareImageMessage}
            shareImageError={shareImageError}
            onShareResult={handleShareResult}
            onSaveImageOnly={handleSaveImageOnly}
            onConsultationClick={() => handleConsultationClick("result_first_view")}
          />

          <FatigueReasonSummary paragraphs={reasonSummaryParagraphs} />

          <MeetingFitSection suitedMeetings={suitedMeetings} drainingMeetings={drainingMeetings} />

          <FatigueReviewAnalysis analysis={reviewAnalysis} />

          <FatigueConsultationCta onClick={() => handleConsultationClick("consultation_block")} />

          <details data-testid="fatigue-reason-detailed-result" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
            <summary className="cursor-pointer text-base font-black leading-7 text-[var(--color-text)]">
              詳しい診断結果を見る
            </summary>
            <div className="mt-5 grid gap-4">
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

              <div className="grid gap-4">
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
