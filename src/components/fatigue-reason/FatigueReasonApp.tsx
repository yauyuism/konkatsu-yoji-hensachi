"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { MoshConsultationCta } from "@/components/MoshConsultationCta";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import {
  FATIGUE_ANSWER_OPTIONS,
  FATIGUE_REASON_ACTION_GUIDES,
  FATIGUE_REASON_QUESTIONS,
  runFatigueReasonDiagnosis,
  type FatigueReasonFactor,
  type FatigueReasonType,
  type FatigueAnswerValue,
} from "@/lib/fatigue-reason";

type FatigueReasonStage = "intro" | "question" | "result";

const analyzingDelayMs = 180;
const factorLabels = ["主因", "副因", "補助要因"] as const;

function getFatigueCtaKind(type: FatigueReasonType) {
  if (type === "wrongPeople") {
    return "profile";
  }

  if (type === "reset") {
    return "twoSessions";
  }

  return "consultation";
}

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

function FactorCard({ factor, index }: { factor: FatigueReasonFactor; index: number }) {
  return (
    <article className="rounded-[1.2rem] border border-[var(--line)] bg-white/86 p-5">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">{factorLabels[index] ?? "要因"}</p>
      <h3 className="mt-2 text-lg font-black leading-tight text-[var(--text-main)]">{factor.result.name}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{FATIGUE_REASON_ACTION_GUIDES[factor.type].shortReason}</p>
    </article>
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

export function FatigueReasonApp() {
  const [stage, setStage] = useState<FatigueReasonStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FatigueAnswerValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<FatigueAnswerValue | null>(null);

  const diagnosis = useMemo(() => runFatigueReasonDiagnosis(answers), [answers]);
  const question = FATIGUE_REASON_QUESTIONS[questionIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIndex, stage]);

  useEffect(() => {
    if (stage !== "result") {
      return;
    }

    markToolCompleted("fatigueReason");
  }, [stage]);

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

  const { result, normalizedScores, rankedFactors, topFactors, introParagraphs } = diagnosis;
  const primaryFactor = topFactors[0];

  if (!primaryFactor) {
    return null;
  }

  const primaryGuide = FATIGUE_REASON_ACTION_GUIDES[primaryFactor.type];
  const secondaryFactors = topFactors.slice(1);
  const suitedMeetings = mergeGuideItems(topFactors.slice(0, 2), "suitedMeetings");
  const drainingMeetings = mergeGuideItems(topFactors.slice(0, 2), "drainingMeetings");

  return (
    <section data-testid="fatigue-reason-result" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          RESULT
        </p>
        <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          あなたが婚活疲れしている一番の理由
          <span className="block text-[var(--accent)]">{result.name}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-bold leading-8 text-[var(--text-main)] sm:text-base">
          {result.catchCopy}
        </p>

        <div className="mt-8 grid gap-4">
          <section data-testid="fatigue-reason-top-factors" className="grid gap-4 lg:grid-cols-3">
            {topFactors.map((factor, index) => (
              <FactorCard key={factor.type} factor={factor} index={index} />
            ))}
          </section>

          <ResultSection title="あなたが疲れている理由">
            <div className="mt-4 grid gap-3 text-sm leading-8 text-[var(--text-sub)]">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ResultSection>

          <ResultSection title="主因の詳しい説明">
            <div className="mt-4 grid gap-6 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-black leading-6 text-[var(--text-main)]">なぜ疲れているのか</h3>
                <div className="mt-3 grid gap-3 text-sm leading-8 text-[var(--text-sub)]">
                  {result.reason.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black leading-6 text-[var(--text-main)]">どんな場面で疲れやすいか</h3>
                <ResultList items={result.commonStates} />
              </div>
              <div>
                <h3 className="text-sm font-black leading-6 text-[var(--text-main)]">無理に頑張らなくていいこと</h3>
                <ResultList items={result.stopTrying} />
              </div>
            </div>
          </ResultSection>

          <ResultSection title="次に強く出ている理由">
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {secondaryFactors.map((factor, index) => (
                <FactorCard key={factor.type} factor={factor} index={index + 1} />
              ))}
            </div>
          </ResultSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultSection title="まず見直すこと">
              <ResultList items={primaryGuide.reviewActions} />
            </ResultSection>

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

          <details className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
            <summary className="cursor-pointer text-sm font-black tracking-[0.14em] text-[var(--color-text)]">
              詳しいスコアを見る
            </summary>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
              ここは参考用です。結果本文では、パーセンテージではなく上位の原因から見立てています。
            </p>
            <div className="mt-4 grid gap-3">
              {rankedFactors.map((factor) => (
                <div key={factor.type} className="grid grid-cols-[minmax(6.5rem,9rem)_1fr_3rem] items-center gap-3 text-sm">
                  <span className="text-xs font-bold leading-5 text-[var(--text-main)] sm:text-sm">{factor.result.name}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
                    <span
                      className="block h-full rounded-full bg-[var(--color-main)]"
                      style={{ width: `${Math.round(normalizedScores[factor.type] * 100)}%` }}
                    />
                  </span>
                  <span className="font-numeric text-xs font-black text-[var(--text-main)]">
                    {Math.round(normalizedScores[factor.type] * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </details>

          <MoshConsultationCta
            placement="fatigue_reason_result"
            quizName="婚活疲れ・マチアプ疲れの理由診断"
            resultType={result.type}
            ctaKind={getFatigueCtaKind(result.type)}
          />
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
