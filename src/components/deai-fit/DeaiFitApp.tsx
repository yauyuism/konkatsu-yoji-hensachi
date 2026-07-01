"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { DeaiFitRadarChart } from "@/components/deai-fit/DeaiFitRadarChart";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import {
  DEAI_FIT_ANSWER_OPTIONS,
  DEAI_FIT_AXIS_PAIRS,
  DEAI_FIT_QUESTIONS,
  buildDeaiFitDiagnosisFromResultType,
  runDeaiFitDiagnosis,
  type DeaiFitAnswerValue,
  type DeaiFitLetter,
  type DeaiFitScores,
  type DeaiFitType,
} from "@/lib/deai-fit";
import { DEAI_FIT_DISPLAY_META } from "@/lib/deai-fit-display";
import { getDeaiFitResultUrl, getDeaiFitXShareUrl } from "@/lib/deai-fit-share";
import { downloadResultImage } from "@/lib/result-image";
import { CONSULTATION_STORE_URL } from "@/lib/service-links";

type DeaiFitStage = "intro" | "question" | "result";
type AxisBarItem = {
  axis: string;
  leftCode: DeaiFitLetter;
  rightCode: DeaiFitLetter;
  leftTitle: string;
  rightTitle: string;
  leftDescription: string;
  rightDescription: string;
  activeCode: DeaiFitLetter;
  activeTitle: string;
  activeDescription: string;
  markerPosition: number;
};

const analyzingDelayMs = 180;
const DEAI_FIT_LETTER_MAX_SCORE = 15;
const FATIGUE_DIAGNOSIS_PATH = "/diagnoses/konkatsu-fatigue";
const nextDiagnostics = [
  {
    href: FATIGUE_DIAGNOSIS_PATH,
    title: "婚活疲れ・マチアプ疲れの理由診断",
    body: "会えるのに進まない理由、会ったあとに疲れる理由を整理します。",
  },
  {
    href: "/prof",
    title: "プロフィール偏差値診断",
    body: "マチアプやSNSで、あなたの魅力がどう届いているかを見直します。",
  },
];

const axisDescriptions: Record<
  DeaiFitLetter,
  {
    title: string;
    description: string;
  }
> = {
  O: {
    title: "Online",
    description: "会う前の情報で判断しやすい",
  },
  F: {
    title: "Offline",
    description: "会ったときの空気感で判断しやすい",
  },
  C: {
    title: "Condition",
    description: "条件や生活観を先に見たい",
  },
  V: {
    title: "Vibe",
    description: "空気感や人柄を重視したい",
  },
  Q: {
    title: "Quick",
    description: "気になる人とは早めに進めたい",
  },
  S: {
    title: "Slow",
    description: "何度か会ってから気持ちが動きやすい",
  },
  D: {
    title: "Direct",
    description: "一対一で相手を見たい",
  },
  N: {
    title: "Network",
    description: "場や人間関係の中で相手を見たい",
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
    { label: "結婚相談所", score: averageScore(scores, ["O", "C", "S", "D"]) },
    { label: "ヒトオシ", score: averageScore(scores, ["O", "C", "N"]) },
    { label: "友人紹介", score: averageScore(scores, ["F", "C", "N"]) },
    { label: "外飲み", score: averageScore(scores, ["F", "V", "Q", "N"]) },
    { label: "行きつけ", score: averageScore(scores, ["F", "V", "S", "N"]) },
    { label: "SNS", score: averageScore(scores, ["O", "V", "S", "N"]) },
    { label: "趣味コミュニティ", score: averageScore(scores, ["F", "V", "S", "N"]) },
    { label: "社会人サークル", score: averageScore(scores, ["F", "C", "S", "N"]) },
    { label: "婚活パーティー", score: averageScore(scores, ["F", "C", "Q", "D"]) },
    { label: "街コン", score: averageScore(scores, ["F", "V", "Q", "N"]) },
    { label: "note / Threads / X", score: averageScore(scores, ["O", "V", "S", "N"]) },
  ].sort((a, b) => b.score - a.score);
}

function getResultLetters(type: DeaiFitType) {
  return type.split("-") as DeaiFitLetter[];
}

function getAxisBarItems(scores: DeaiFitScores, type: DeaiFitType): AxisBarItem[] {
  const resultLetters = getResultLetters(type);

  return DEAI_FIT_AXIS_PAIRS.map((pair, index) => {
    const leftScore = scores[pair.left];
    const rightScore = scores[pair.right];
    const total = Math.max(leftScore + rightScore, 1);
    const activeCode = resultLetters[index] === pair.left ? pair.left : pair.right;
    const rawPosition = Math.round((rightScore / total) * 100);
    const markerPosition = Math.max(6, Math.min(94, rawPosition));
    const activeMeta = axisDescriptions[activeCode];

    return {
      axis: pair.axis,
      leftCode: pair.left,
      rightCode: pair.right,
      leftTitle: axisDescriptions[pair.left].title,
      rightTitle: axisDescriptions[pair.right].title,
      leftDescription: axisDescriptions[pair.left].description,
      rightDescription: axisDescriptions[pair.right].description,
      activeCode,
      activeTitle: activeMeta.title,
      activeDescription: activeMeta.description,
      markerPosition,
    };
  });
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

function DeaiFitResultHeader({
  resultCode,
  resultLabel,
  shortCopy,
  suitedItems,
}: {
  resultCode: DeaiFitType;
  resultLabel: string;
  shortCopy: string;
  suitedItems: string[];
}) {
  return (
    <article
      data-testid="deai-fit-result-hero"
      className="card overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#fff8f3_0%,#ffffff_54%,#f2fbf5_100%)] p-5 text-center sm:p-8"
    >
      <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
        RESULT CARD
      </p>
      <h1 className="mt-5 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-4xl">あなたに合う出会い方は？</h1>
      <p className="mt-4 inline-flex rounded-full border border-[rgba(201,130,120,0.2)] bg-white/86 px-4 py-2 font-numeric text-sm font-black text-[var(--accent)]">
        {resultCode}
      </p>
      <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
        {resultLabel}
      </h2>
      <div className="mx-auto mt-5 max-w-2xl rounded-[1.2rem] bg-white/76 px-4 py-4">
        <p className="text-xs font-black tracking-[0.16em] text-[var(--accent)]">ひとことで言うと</p>
        <p className="mt-2 text-base font-bold leading-8 text-[var(--text-main)] sm:text-lg">{shortCopy}</p>
      </div>
      <ResultTagList title="合いやすい出会い方" items={suitedItems} />
    </article>
  );
}

function DeaiFitShareActions({
  xShareUrl,
  resultCode,
  resultLabel,
  resultUrl,
  isShareResultPage,
}: {
  xShareUrl: string;
  resultCode: DeaiFitType;
  resultLabel: string;
  resultUrl: string;
  isShareResultPage: boolean;
}) {
  const handleShareClick = () => {
    trackEvent("deai_fit_result_share_x_click", {
      result_code: resultCode,
      result_type: resultLabel,
      share_url: resultUrl,
    });
    trackEvent("share_button_click", {
      platform: "x",
      placement: "result_first_view",
      quiz_name: "deai_fit",
      result_type: resultCode,
    });
  };

  const handleConsultationClick = () => {
    trackEvent("deai_fit_result_consultation_click", {
      result_code: resultCode,
      result_type: resultLabel,
      placement: "result_first_view",
    });
    trackEvent("consultation_cta_click", {
      placement: "deai_fit_result_first_view",
      quiz_name: "deai_fit",
      result_type: resultCode,
      cta_kind: "deai_fit_consultation",
    });
  };

  return (
    <section
      data-testid="deai-fit-share-actions"
      className="soft-panel mt-4 rounded-[1.4rem] border border-[rgba(201,130,120,0.16)] bg-white/82 p-4 sm:p-5"
    >
      <p className="text-center text-sm font-bold leading-7 text-[var(--text-sub)]">
        この結果はXでシェアできます。投稿すると、診断カードがリンク画像として表示されます。
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          data-testid="deai-fit-share-x-top"
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShareClick}
          className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-center text-sm font-black"
        >
          診断結果をXにシェア
        </a>
        <a
          data-testid="deai-fit-consultation-top"
          href={CONSULTATION_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleConsultationClick}
          className="btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-center text-sm font-black text-[var(--color-main)]"
        >
          診断結果をもとに相談する
        </a>
        {isShareResultPage ? (
          <Link
            data-testid="deai-fit-start-from-share"
            href="/diagnoses/deai-fit"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 py-3.5 text-center text-sm font-black text-[var(--text-main)] transition hover:border-[rgba(201,130,120,0.34)]"
          >
            診断をやってみる
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function TrackableBottomShareLink({
  xShareUrl,
  onShareClick,
}: {
  xShareUrl: string;
  onShareClick: () => void;
}) {
  return (
    <a
      data-testid="deai-fit-share-x-bottom"
      href={xShareUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onShareClick}
      className="btn-primary inline-flex rounded-full px-6 py-3.5 text-sm font-black"
    >
      診断結果をXにシェア
    </a>
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

function DeaiFitAxisBars({ items }: { items: AxisBarItem[] }) {
  return (
    <section data-testid="deai-fit-axis-bars" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">4 AXES</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">4軸で見る出会い方のクセ</h2>
        </div>
        <p className="text-sm leading-7 text-[var(--text-sub)] sm:max-w-sm">
          点数よりも、どちら側に寄っているかを見るための地図です。
        </p>
      </div>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <article key={item.axis} className="rounded-[1.15rem] border border-[var(--line)] bg-white/82 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-numeric text-xs font-black tracking-[0.16em] text-[var(--accent)]">
                  {item.leftCode} / {item.rightCode}
                </p>
                <p className="mt-1 text-sm font-black leading-6 text-[var(--text-main)]">{item.activeDescription}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[rgba(201,130,120,0.1)] px-3 py-1 font-numeric text-xs font-black text-[var(--accent)]">
                {item.activeCode}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 text-xs font-black text-[var(--text-main)] sm:text-sm">
                <span>{item.leftTitle}</span>
                <span>{item.rightTitle}</span>
              </div>
              <div className="relative mt-3 h-3 rounded-full bg-[linear-gradient(90deg,rgba(201,130,120,0.22),rgba(143,183,161,0.25))]">
                <span
                  className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[var(--accent)] shadow-[0_8px_20px_rgba(120,88,70,0.18)]"
                  style={{ left: `${item.markerPosition}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[0.72rem] font-bold leading-5 text-[var(--text-sub)] sm:text-xs">
                <p>{item.leftDescription}</p>
                <p className="text-right">{item.rightDescription}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
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
    <div data-testid="deai-fit-meeting-bars" className="rounded-[1.2rem] border border-[var(--line)] bg-white/78 p-4 sm:p-5">
      <h3 className="text-xs font-black tracking-[0.14em] text-[var(--color-text)]">相性が高く出た入口</h3>
      <div className="mt-4 grid gap-3">
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
    </div>
  );
}

function DeaiFitMethodMap({
  suitedItems,
  notFitItems,
  meetingScores,
}: {
  suitedItems: string[];
  notFitItems: string[];
  meetingScores: Array<{ label: string; score: number }>;
}) {
  return (
    <section data-testid="deai-fit-method-map" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">METHOD MAP</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">あなたの出会い方マップ</h2>
        </div>
        <p className="text-sm leading-7 text-[var(--text-sub)] sm:max-w-sm">
          ひとつに決めるより、合いやすい入口を組み合わせるためのマップです。
        </p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-4">
          <article className="rounded-[1.2rem] border border-[rgba(143,183,161,0.2)] bg-[rgba(244,251,246,0.72)] p-4 sm:p-5">
            <h3 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">合いやすい出会い方</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {suitedItems.map((item) => (
                <span key={item} className="tag bg-white/88">
                  {item}
                </span>
              ))}
            </div>
          </article>
          <article className="rounded-[1.2rem] border border-[rgba(201,130,120,0.16)] bg-[rgba(255,248,243,0.72)] p-4 sm:p-5">
            <h3 className="text-sm font-black tracking-[0.14em] text-[var(--color-text)]">
              主戦場にしすぎると疲れやすい出会い方
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {notFitItems.map((item) => (
                <span key={item} className="tag bg-white/88">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
        <MeetingFitBars items={meetingScores.slice(0, 6)} />
      </div>
    </section>
  );
}

function ShareResultCard({
  resultCode,
  resultLabel,
  shortCopy,
  axisItems,
  suitedItems,
}: {
  resultCode: DeaiFitType;
  resultLabel: string;
  shortCopy: string;
  axisItems: AxisBarItem[];
  suitedItems: string[];
}) {
  return (
    <article
      data-testid="deai-fit-share-card"
      className="card overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#fffaf6_0%,#ffffff_52%,#f4fbf6_100%)] p-5 sm:p-7"
    >
      <p className="text-center text-xs font-black tracking-[0.18em] text-[var(--accent)]">あなたの出会い方診断結果</p>
      <p className="mt-4 text-center font-numeric text-sm font-black tracking-[0.16em] text-[var(--text-sub)]">{resultCode}</p>
      <h2 className="mt-2 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-4xl">{resultLabel}</h2>
      <div className="mt-5 rounded-[1.2rem] bg-white/80 px-4 py-4">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--accent)]">ひとことで言うと</p>
        <p className="mt-2 text-sm font-bold leading-7 text-[var(--text-main)] sm:text-base">{shortCopy}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {axisItems.map((item) => (
          <div key={item.axis} className="rounded-[0.9rem] border border-[rgba(63,52,46,0.08)] bg-white/74 px-3 py-2">
            <p className="font-numeric text-xs font-black text-[var(--accent)]">
              {item.leftCode}/{item.rightCode} → {item.activeCode}
            </p>
            <p className="mt-1 text-[0.72rem] font-bold leading-5 text-[var(--text-main)]">{item.activeTitle}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--accent)]">合いやすい出会い方</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suitedItems.slice(0, 5).map((item) => (
            <span key={item} className="rounded-full bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--text-main)]">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 font-numeric text-xs font-bold text-[var(--text-sub)]">
        <span>shindanlab.jp</span>
        <span>やうゆ式</span>
      </div>
    </article>
  );
}

function DeaiFitNextDiagnostics({ resultCode, resultLabel }: { resultCode: DeaiFitType; resultLabel: string }) {
  return (
    <section data-testid="deai-fit-next-diagnostics" className="soft-panel rounded-[1.4rem] p-5 sm:p-6">
      <h2 className="text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">次におすすめの診断</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {nextDiagnostics.map((diagnosis) => (
          <Link
            key={diagnosis.href}
            href={diagnosis.href}
            onClick={() => {
              trackEvent("deai_fit_next_diagnosis_click", {
                placement: "deai_fit_result",
                result_code: resultCode,
                result_type: resultLabel,
                next_diagnosis: diagnosis.title,
              });
              trackEvent("related_diagnosis_click", {
                placement: "deai_fit_result",
                quiz_name: "deai_fit",
                result_type: resultCode,
                related_title: diagnosis.title,
              });
            }}
            className="rounded-[1.2rem] border border-[var(--line)] bg-white/86 p-5 transition hover:-translate-y-0.5 hover:border-[rgba(201,130,120,0.34)]"
          >
            <h3 className="text-base font-black leading-7 text-[var(--text-main)]">{diagnosis.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{diagnosis.body}</p>
            <span className="text-link mt-4 inline-flex">やってみる →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DeaiFitConsultationCta({ resultCode, resultLabel }: { resultCode: DeaiFitType; resultLabel: string }) {
  const handleClick = () => {
    trackEvent("deai_fit_result_consultation_click", {
      placement: "deai_fit_result",
      result_code: resultCode,
      result_type: resultLabel,
    });
    trackEvent("consultation_cta_click", {
      placement: "deai_fit_result_bottom",
      quiz_name: "deai_fit",
      result_type: resultCode,
      cta_kind: "fatigue_language_consultation",
    });
  };

  return (
    <section data-testid="deai-fit-store-cta" className="soft-panel rounded-[1.4rem] border border-[rgba(63,52,46,0.08)] bg-white/72 p-5 sm:p-6">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">SECOND OPINION</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">
        自分に合う出会い方を、個別に整理したい人へ。
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">
        <p>
          診断では大まかな傾向が分かります。ただ、実際にはプロフィール、使っているアプリ、過去の恋愛、相談所に入るかどうか、外飲みや紹介への向き不向きまで見ると、出会い方はもっと具体的に整理できます。
        </p>
        <p>
          マチアプ、相談所、紹介、SNS、外飲みまで含めて、無理しない進め方を一緒に考えたい人は、やうゆ式の婚活の見直し相談で話せます。
        </p>
      </div>
      <a
        href={CONSULTATION_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="btn-primary mt-5 inline-flex min-h-12 rounded-full px-6 py-3.5 text-sm font-black"
      >
        自分に合う出会い方を相談する
      </a>
    </section>
  );
}

export function DeaiFitApp({
  initialResultType = null,
  isShareResultPage = false,
}: {
  initialResultType?: DeaiFitType | null;
  isShareResultPage?: boolean;
}) {
  const [stage, setStage] = useState<DeaiFitStage>(initialResultType ? "result" : "intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DeaiFitAnswerValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<DeaiFitAnswerValue | null>(null);
  const [isSavingShareImage, setIsSavingShareImage] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const diagnosis = useMemo(() => {
    if (initialResultType && answers.length === 0) {
      return buildDeaiFitDiagnosisFromResultType(initialResultType);
    }

    return runDeaiFitDiagnosis(answers);
  }, [answers, initialResultType]);
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
    if (isShareResultPage) {
      const shareResultMeta = DEAI_FIT_DISPLAY_META[diagnosis.result.type];
      trackEvent("deai_fit_result_share_page_view", {
        result_code: diagnosis.result.type,
        result_type: shareResultMeta.resultLabel,
      });
    }
  }, [diagnosis.result.name, diagnosis.result.type, isShareResultPage, stage]);

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
    if (stage === "result") {
      const restartResultMeta = DEAI_FIT_DISPLAY_META[diagnosis.result.type];
      trackEvent("deai_fit_result_retry_click", {
        placement: "deai_fit_result",
        result_code: diagnosis.result.type,
        result_type: restartResultMeta.resultLabel,
      });
    }

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
  const resultMeta = DEAI_FIT_DISPLAY_META[result.type];
  const radarData = buildRadarData(scores);
  const meetingScores = buildMeetingScores(scores);
  const axisItems = getAxisBarItems(scores, result.type);
  const suitedTop = result.suited.slice(0, 5);
  const suitedHero = result.suited.slice(0, 3);
  const notFitTop = result.notFit.slice(0, 4);
  const resultUrl = getDeaiFitResultUrl(result.type);
  const xShareUrl = getDeaiFitXShareUrl({
    resultCode: result.type,
    resultLabel: resultMeta.resultLabel,
    shortCopy: resultMeta.shareCopy,
    suitedItems: suitedHero,
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
      heading: notFitTop.slice(0, 2).join("・"),
      body: result.drainPattern,
    },
  ];

  const handleXShareClick = (placement: "share_card") => {
    trackEvent("deai_fit_result_share_x_click", {
      placement,
      result_code: result.type,
      result_type: resultMeta.resultLabel,
      share_url: resultUrl,
    });
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

  const handleSaveShareImage = async () => {
    if (!shareCardRef.current || isSavingShareImage) {
      return;
    }

    setIsSavingShareImage(true);

    try {
      trackEvent("deai_fit_result_save_image_click", {
        placement: "share_card",
        result_code: result.type,
        result_type: resultMeta.resultLabel,
      });
      trackEvent("save_image_click", {
        placement: "share_card",
        quiz_name: "deai_fit",
        result_type: result.type,
      });

      await downloadResultImage(shareCardRef.current, `deai-fit-${result.type}.png`);
    } finally {
      setIsSavingShareImage(false);
    }
  };

  return (
    <section data-testid="deai-fit-result" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <DeaiFitResultHeader
          resultCode={result.type}
          resultLabel={resultMeta.resultLabel}
          shortCopy={resultMeta.shareCopy}
          suitedItems={suitedHero}
        />
        <DeaiFitShareActions
          xShareUrl={xShareUrl}
          resultCode={result.type}
          resultLabel={resultMeta.resultLabel}
          resultUrl={resultUrl}
          isShareResultPage={isShareResultPage}
        />

        <div className="mt-8 grid gap-4">
          <DeaiFitAxisBars items={axisItems} />

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

          <DeaiFitMethodMap suitedItems={suitedTop} notFitItems={notFitTop} meetingScores={meetingScores} />

          <ResultSection title="8項目チャート">
            <div data-testid="deai-fit-radar" className="mx-auto mt-5 max-w-[360px]">
              <DeaiFitRadarChart data={radarData} />
            </div>
          </ResultSection>

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
                スクショしてシェアしやすい結果カードです。タイプコード、4軸、合いやすい出会い方だけに絞っています。
              </p>
            </div>
            <div ref={shareCardRef}>
              <ShareResultCard
                resultCode={result.type}
                resultLabel={resultMeta.resultLabel}
                shortCopy={resultMeta.shareCopy}
                axisItems={axisItems}
                suitedItems={suitedTop}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <TrackableBottomShareLink xShareUrl={xShareUrl} onShareClick={() => handleXShareClick("share_card")} />
              <button
                data-testid="deai-fit-save-card"
                type="button"
                onClick={handleSaveShareImage}
                disabled={isSavingShareImage}
                className="btn-secondary inline-flex rounded-full px-6 py-3.5 text-sm font-black text-[var(--color-main)] disabled:cursor-wait disabled:opacity-70"
              >
                {isSavingShareImage ? "画像を保存しています..." : "結果を画像で保存"}
              </button>
            </div>
          </section>

          <DeaiFitNextDiagnostics resultCode={result.type} resultLabel={resultMeta.resultLabel} />

          <DeaiFitConsultationCta resultCode={result.type} resultLabel={resultMeta.resultLabel} />
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
