"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { DeaiFitRadarChart } from "@/components/deai-fit/DeaiFitRadarChart";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import {
  DEAI_FIT_ANSWER_OPTIONS,
  DEAI_FIT_AXIS_PAIRS,
  DEAI_FIT_QUESTIONS,
  runDeaiFitDiagnosis,
  type DeaiFitAnswerValue,
  type DeaiFitLetter,
  type DeaiFitScores,
  type DeaiFitType,
} from "@/lib/deai-fit";
import { getDeaiFitResultUrl, getDeaiFitXShareUrl } from "@/lib/deai-fit-share";
import { MOSH_SERVICES_URL } from "@/lib/service-links";

type DeaiFitStage = "intro" | "question" | "result";

const analyzingDelayMs = 180;
const DEAI_FIT_LETTER_MAX_SCORE = 15;
const FATIGUE_DIAGNOSIS_PATH = "/diagnoses/konkatsu-fatigue";

const resultDisplayMeta: Record<DeaiFitType, { resultLabel: string; shareCopy: string }> = {
  "O-C-Q-D": {
    resultLabel: "条件検索即決型",
    shareCopy: "条件で候補を絞って、合いそうなら早めに一対一で進めたいタイプです。",
  },
  "O-C-Q-N": {
    resultLabel: "紹介活用型",
    shareCopy: "条件の安心感に、誰かの信用が加わると動きやすいタイプです。",
  },
  "O-C-S-D": {
    resultLabel: "条件じっくり型",
    shareCopy: "条件は大事。でも気持ちは、何度か会う中で育てたいタイプです。",
  },
  "O-C-S-N": {
    resultLabel: "安心紹介育成型",
    shareCopy: "条件も安心感もほしい。紹介やコミュニティで少しずつ育ちやすいタイプです。",
  },
  "O-V-Q-D": {
    resultLabel: "SNS瞬発型",
    shareCopy: "文章や投稿の温度感で気になり、会ったら早めに進みたいタイプです。",
  },
  "O-V-Q-N": {
    resultLabel: "SNS人脈拡張型",
    shareCopy: "オンラインの空気感から入り、人間関係が広がる中で恋愛に進みやすいタイプです。",
  },
  "O-V-S-D": {
    resultLabel: "文章じわ好き型",
    shareCopy: "相手の文章や日常の出し方から、少しずつ好きになりやすいタイプです。",
  },
  "O-V-S-N": {
    resultLabel: "SNS余白型",
    shareCopy: "オンライン上でゆるくつながり、何度も目に入る中で気持ちが動きやすいタイプです。",
  },
  "F-C-Q-D": {
    resultLabel: "対面即決型",
    shareCopy: "最低限の条件を見たら、あとは会ったときの感覚で早めに進めたいタイプです。",
  },
  "F-C-Q-N": {
    resultLabel: "紹介即決型",
    shareCopy: "誰かの信用がある状態で会い、合えば早めに次へ進めたいタイプです。",
  },
  "F-C-S-D": {
    resultLabel: "対面じっくり型",
    shareCopy: "会って話したい。でも、好きになるまでは時間をかけたいタイプです。",
  },
  "F-C-S-N": {
    resultLabel: "生活観育成型",
    shareCopy: "人柄も条件も、何度か顔を合わせる中で見ていきたいタイプです。",
  },
  "F-V-Q-D": {
    resultLabel: "直感対面型",
    shareCopy: "会った瞬間の空気感や会話のテンポで、恋愛が動きやすいタイプです。",
  },
  "F-V-Q-N": {
    resultLabel: "外飲み発展型",
    shareCopy: "場のノリ、偶然、紹介の連鎖から恋愛が動きやすいタイプです。",
  },
  "F-V-S-D": {
    resultLabel: "一対一空気育成型",
    shareCopy: "条件より空気感重視。落ち着いた一対一でゆっくり相手を見たいタイプです。",
  },
  "F-V-S-N": {
    resultLabel: "生活圏拡張型",
    shareCopy: "条件で探すより、日常の中で人を好きになるタイプです。",
  },
};

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

function normalizeScore(score: number) {
  return Math.max(0, Math.min(100, Math.round((score / DEAI_FIT_LETTER_MAX_SCORE) * 100)));
}

function averageScore(scores: DeaiFitScores, letters: DeaiFitLetter[]) {
  const total = letters.reduce((sum, letter) => sum + normalizeScore(scores[letter]), 0);
  return Math.round(total / letters.length);
}

function buildRadarData(scores: DeaiFitScores) {
  return [
    { label: "条件確認", score: normalizeScore(scores.C) },
    { label: "対面感覚", score: normalizeScore(scores.F) },
    { label: "早め進展", score: normalizeScore(scores.Q) },
    { label: "関係育成", score: normalizeScore(scores.S) },
    { label: "一対一", score: normalizeScore(scores.D) },
    { label: "紹介相性", score: averageScore(scores, ["F", "C", "N"]) },
    { label: "SNS余白", score: averageScore(scores, ["O", "V", "S", "N"]) },
    { label: "生活圏", score: averageScore(scores, ["F", "V", "S", "N"]) },
  ];
}

function buildMeetingScores(scores: DeaiFitScores) {
  return [
    { label: "マチアプ", score: averageScore(scores, ["O", "C", "Q", "D"]) },
    { label: "結婚相談所", score: averageScore(scores, ["C", "S", "D"]) },
    { label: "友達の紹介", score: averageScore(scores, ["F", "C", "N"]) },
    { label: "外飲み", score: averageScore(scores, ["F", "V", "Q", "N"]) },
    { label: "SNS", score: averageScore(scores, ["O", "V", "S", "N"]) },
    { label: "趣味コミュニティ", score: averageScore(scores, ["F", "V", "S", "N"]) },
    { label: "職場・生活圏", score: averageScore(scores, ["F", "V", "S", "N"]) },
    { label: "イベント", score: averageScore(scores, ["F", "V", "Q", "N"]) },
  ].sort((a, b) => b.score - a.score);
}

function ResultTagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-black tracking-[0.16em] text-[var(--accent)]">{title}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>
    </div>
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

function FitRouteCard({
  title,
  heading,
  body,
  index,
}: {
  title: string;
  heading: string;
  body: string;
  index: number;
}) {
  return (
    <article
      className={`rounded-[1.25rem] border p-5 ${
        index === 0
          ? "border-[rgba(201,130,120,0.26)] bg-[linear-gradient(135deg,rgba(255,245,240,0.95),rgba(255,255,255,0.92))] shadow-[0_18px_40px_rgba(120,88,70,0.12)]"
          : "border-[var(--line)] bg-white/86"
      }`}
    >
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">{title}</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-[var(--text-main)]">{heading}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{body}</p>
    </article>
  );
}

function MeetingFitBars({ items }: { items: Array<{ label: string; score: number }> }) {
  return (
    <section data-testid="deai-fit-meeting-bars" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">出会い方の相性</h2>
      <div className="mt-5 grid gap-4">
        {items.map((item, index) => {
          const width = Math.max(item.score, 6);

          return (
            <div key={item.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-4 text-sm font-black text-[var(--text-main)]">
                <span>{item.label}</span>
                <span className="font-numeric">{item.score}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
                <div
                  className={`h-full rounded-full ${index < 3 ? "bg-[var(--accent)]" : "bg-[rgba(201,130,120,0.34)]"}`}
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

function ShareResultCard({
  resultLabel,
  shortCopy,
  suitedItems,
  notFitItem,
}: {
  resultLabel: string;
  shortCopy: string;
  suitedItems: string[];
  notFitItem: string;
}) {
  return (
    <article
      data-testid="deai-fit-share-card"
      className="card overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#fffaf6_0%,#ffffff_52%,#f4fbf6_100%)] p-5 sm:p-7"
    >
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">あなたに合う出会い方診断</p>
      <p className="mt-4 text-sm font-bold leading-7 text-[var(--text-sub)]">私は</p>
      <h2 className="mt-1 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-4xl">{resultLabel}</h2>
      <p className="mt-4 text-base font-bold leading-8 text-[var(--text-main)]">{shortCopy}</p>
      <div className="mt-5 grid gap-2 text-sm leading-7 text-[var(--text-main)]">
        <p className="font-black text-[var(--accent)]">向いている出会い方</p>
        {suitedItems.map((item, index) => (
          <p key={item}>
            {index + 1}. {item}
          </p>
        ))}
        <p className="pt-2">
          <span className="font-black text-[var(--accent)]">疲れやすい出会い方：</span>
          {notFitItem}
        </p>
      </div>
      <p className="mt-5 font-numeric text-xs font-bold text-[var(--text-sub)]">shindanlab.jp</p>
    </article>
  );
}

function RelatedFatigueCta() {
  const handleClick = () => {
    trackEvent("related_diagnosis_click", {
      placement: "deai_fit_result",
      quiz_name: "deai_fit",
      related_title: "婚活疲れ・マチアプ疲れ診断",
    });
  };

  return (
    <section data-testid="deai-fit-fatigue-cta" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">
        婚活で疲れている理由も知りたい人へ
      </h2>
      <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        自分に合う出会い方が分かっても、今までの婚活で何に疲れていたのかが分からないと、同じ疲れ方を繰り返すことがあります。
        会えるのに進まない理由、会ったあとに疲れる理由を知りたい人は、婚活疲れ・マチアプ疲れ診断も試してみてください。
      </p>
      <Link
        href={FATIGUE_DIAGNOSIS_PATH}
        onClick={handleClick}
        className="btn-secondary mt-5 inline-flex rounded-full px-6 py-3.5 text-sm font-black text-[var(--color-main)]"
      >
        婚活疲れ・マチアプ疲れ診断をやってみる
      </Link>
    </section>
  );
}

function DeaiFitConsultationCta({ resultType }: { resultType: DeaiFitType }) {
  const handleClick = () => {
    trackEvent("consultation_cta_click", {
      placement: "deai_fit_result_bottom",
      quiz_name: "deai_fit",
      result_type: resultType,
      cta_kind: "fatigue_language_consultation",
    });
  };

  return (
    <section data-testid="deai-fit-mosh-cta" className="soft-panel rounded-[1.4rem] border border-[rgba(63,52,46,0.08)] bg-white/72 p-5 sm:p-6">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">SECOND OPINION</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">
        自分の場合を見てほしい人へ
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        <p>
          診断結果は入口です。プロフィールの見せ方、今までの出会い方、会ってきた相手、LINE、会ったあとの感情まで見ると、どの出会い方が本当に合っているのかはもっと具体的に見えてきます。
        </p>
        <p>
          婚活をもっと頑張らせるための相談ではありません。合っていない頑張り方をやめるための、婚活のセカンドオピニオンです。
        </p>
      </div>
      <a
        href={MOSH_SERVICES_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="btn-primary mt-5 inline-flex min-h-12 rounded-full px-6 py-3.5 text-sm font-black"
      >
        婚活疲れの言語化相談を見てみる
      </a>
    </section>
  );
}

export function DeaiFitApp() {
  const [stage, setStage] = useState<DeaiFitStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DeaiFitAnswerValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<DeaiFitAnswerValue | null>(null);

  const diagnosis = useMemo(() => runDeaiFitDiagnosis(answers), [answers]);
  const question = DEAI_FIT_QUESTIONS[questionIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIndex, stage]);

  useEffect(() => {
    if (stage !== "result") {
      return;
    }

    markToolCompleted("deaiFit");
    trackEvent("result_view", {
      quiz_name: "deai_fit",
      result_type: diagnosis.result.type,
      result_name: diagnosis.result.name,
    });
    trackEvent("radar_chart_view", {
      quiz_name: "deai_fit",
      result_type: diagnosis.result.type,
    });
  }, [diagnosis.result.name, diagnosis.result.type, stage]);

  const handleStart = () => {
    trackEvent("diagnosis_start", {
      quiz_name: "deai_fit",
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

  const handleSelect = (value: DeaiFitAnswerValue) => {
    if (selectedValue !== null) {
      return;
    }

    const nextAnswers = [...answers, value];
    setSelectedValue(value);

    trackEvent("question_answered", {
      quiz_name: "deai_fit",
      question_id: question.id,
      answer_value: value,
      progress: questionIndex + 1,
    });

    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelectedValue(null);

      if (questionIndex === DEAI_FIT_QUESTIONS.length - 1) {
        const completed = runDeaiFitDiagnosis(nextAnswers);
        trackEvent("diagnosis_complete", {
          quiz_name: "deai_fit",
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
      <section data-testid="deai-fit-intro" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
            FREE DIAGNOSIS
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
            あなたに合う出会い方診断
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-8 text-[var(--text-main)] sm:text-base">
            マチアプ、相談所、紹介、SNS、外飲み。あなたの恋愛が進みやすい出会い方を16タイプで診断します。
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
            出会い方に正解はありません。でも、自分に合わない出会い方で頑張り続けると、
            会えるのに進まない、好きになれない、会ったあとに疲れる、という状態になりやすくなります。
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
            オンライン・オフライン、条件・空気感、スピード感、一対一か人間関係経由か。
            4つの軸から、あなたの恋愛が進みやすい環境を整理します。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="tag">全24問</span>
            <span className="tag">約3〜5分</span>
            <span className="tag">16タイプ</span>
            <span className="tag">無料</span>
          </div>
          <button
            type="button"
            onClick={handleStart}
            data-testid="deai-fit-start"
            className="btn-primary mt-8 rounded-full px-7 py-4 text-sm font-black"
          >
            診断を始める
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">この診断で分かること</p>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              あなたに合いやすい出会い方、主戦場にしすぎると疲れやすい出会い方、今日から試せる行動を返します。
            </p>
          </section>
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">使い方</p>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              診断は採点ではありません。自分の恋愛が進みやすい環境を知り、合わない頑張り方を減らすためのメモとして使ってください。
            </p>
          </section>
        </div>
      </section>
    );
  }

  if (stage === "question") {
    const progress = ((questionIndex + 1) / DEAI_FIT_QUESTIONS.length) * 100;

    return (
      <section data-testid="deai-fit-question" className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
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
              {questionIndex + 1} / {DEAI_FIT_QUESTIONS.length}
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
              {DEAI_FIT_ANSWER_OPTIONS.map((option) => {
                const isSelected = selectedValue === option.value;

                return (
                  <button
                    key={`${question.id}-${option.value}`}
                    type="button"
                    data-answer-value={option.value}
                    onClick={() => handleSelect(option.value)}
                    disabled={selectedValue !== null}
                    className={`deai-fit-answer choice-button rounded-[1.1rem] border px-4 py-4 text-left text-sm font-bold leading-7 transition sm:text-base ${
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

  const { result, scores } = diagnosis;
  const resultMeta = resultDisplayMeta[result.type];
  const radarData = buildRadarData(scores);
  const meetingScores = buildMeetingScores(scores);
  const suitedTop = result.suited.slice(0, 3);
  const notFitTop = result.notFit.slice(0, 2);
  const resultUrl = getDeaiFitResultUrl(result.type);
  const xShareUrl = getDeaiFitXShareUrl({
    resultLabel: resultMeta.resultLabel,
    shortCopy: resultMeta.shareCopy,
    resultUrl,
  });
  const routeCards = [
    {
      title: "いちばん合いそうな出会い方",
      heading: suitedTop.slice(0, 2).join("・"),
      body: result.progressCondition,
    },
    {
      title: "広げるとよさそうな場所",
      heading: suitedTop.slice(1, 3).join("・") || suitedTop[0],
      body: result.nextActions[0] ?? "まずは、自分が自然にいられる出会い方をひとつ増やしてみてください。",
    },
    {
      title: "疲れやすい出会い方",
      heading: notFitTop.join("・"),
      body: result.drainPattern,
    },
  ];

  const handleXShareClick = (placement: "result_hero" | "share_card") => {
    trackEvent("share_button_click", {
      platform: "x",
      placement,
      quiz_name: "deai_fit",
      result_type: result.type,
    });
    trackEvent("x_share_click", {
      placement,
      quiz_name: "deai_fit",
      result_type: result.type,
    });
  };

  return (
    <section data-testid="deai-fit-result" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <article
          data-testid="deai-fit-result-hero"
          className="card overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#fff8f3_0%,#ffffff_54%,#f2fbf5_100%)] p-5 text-center sm:p-8"
        >
          <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
            RESULT CARD
          </p>
          <p className="mt-5 text-xs font-black tracking-[0.18em] text-[var(--accent)]">あなたに合う出会い方診断</p>
          <p className="mt-5 text-sm font-bold leading-7 text-[var(--text-sub)]">あなたは</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-6xl">{resultMeta.resultLabel}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-8 text-[var(--text-main)] sm:text-lg">
            {resultMeta.shareCopy}
          </p>
          <div data-testid="deai-fit-radar" className="mx-auto mt-5 max-w-[360px]">
            <DeaiFitRadarChart data={radarData} />
          </div>
          <ResultTagList title="向いている出会い方" items={suitedTop} />
          <a
            data-testid="deai-fit-share-x-top"
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleXShareClick("result_hero")}
            className="btn-primary mt-6 inline-flex rounded-full px-6 py-3.5 text-sm font-black"
          >
            Xで結果をシェアする
          </a>
        </article>

        <div className="mt-8 grid gap-4">
          <section data-testid="deai-fit-route-cards" className="grid gap-4 lg:grid-cols-3">
            {routeCards.map((card, index) => (
              <FitRouteCard
                key={card.title}
                title={card.title}
                heading={card.heading}
                body={card.body}
                index={index}
              />
            ))}
          </section>

          <MeetingFitBars items={meetingScores} />

          <ResultSection title="あなたに起きやすいこと">
            <ResultList items={result.likely} />
          </ResultSection>

          <ResultSection title="好きになりやすい入口">
            <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">{result.progressCondition}</p>
          </ResultSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultSection title="いちばん合いそうな出会い方">
              <ResultList items={result.suited} />
            </ResultSection>

            <ResultSection title="疲れやすい出会い方">
              <ResultList items={result.notFit} />
            </ResultSection>
          </div>

          <ResultSection title="疲れやすい婚活パターン">
            <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">{result.drainPattern}</p>
          </ResultSection>

          <ResultSection title="今日からできるネクストアクション">
            <ResultList items={result.nextActions} />
          </ResultSection>

          <section className="grid gap-4">
            <div>
              <h2 className="text-center text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">スクショ用カード</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-[var(--text-sub)]">
                結果を貼るなら、このカードが一番伝わりやすいです。向いている出会い方と疲れやすい出会い方だけに絞っています。
              </p>
            </div>
            <ShareResultCard
              resultLabel={resultMeta.resultLabel}
              shortCopy={resultMeta.shareCopy}
              suitedItems={suitedTop}
              notFitItem={result.notFit[0] ?? "短期判断の婚活"}
            />
            <div className="flex justify-center">
              <a
                data-testid="deai-fit-share-x-bottom"
                href={xShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleXShareClick("share_card")}
                className="btn-primary inline-flex rounded-full px-6 py-3.5 text-sm font-black"
              >
                Xで結果をシェアする
              </a>
            </div>
          </section>

          <section className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
            <h2 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">出会い方の4軸メモ</h2>
            <div className="mt-4 grid gap-3">
              {DEAI_FIT_AXIS_PAIRS.map((pair) => {
                const leftScore = scores[pair.left];
                const rightScore = scores[pair.right];
                const total = Math.max(leftScore + rightScore, 1);
                const leftPercent = Math.round((leftScore / total) * 100);

                return (
                  <div key={pair.axis} className="grid gap-2 rounded-[1rem] bg-white/78 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold leading-5 text-[var(--text-main)] sm:text-sm">
                      <span>
                        {pair.left}: {pair.leftLabel}
                      </span>
                      <span>
                        {pair.right}: {pair.rightLabel}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(143,183,161,0.24)]">
                      <span className="block h-full rounded-full bg-[var(--color-main)]" style={{ width: `${leftPercent}%` }} />
                    </div>
                    <p className="text-right font-numeric text-xs font-black text-[var(--text-main)]">
                      {pair.left}
                      {leftScore} / {pair.right}
                      {rightScore}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <RelatedFatigueCta />

          <DeaiFitConsultationCta resultType={result.type} />
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
