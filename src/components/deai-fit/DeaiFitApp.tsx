"use client";

import { useEffect, useMemo, useState } from "react";

import { AikataConsultationCta } from "@/components/AikataConsultationCta";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import {
  DEAI_FIT_QUESTIONS,
  DEAI_FIT_RESULTS,
  DEAI_FIT_TYPE_ORDER,
  runDeaiFitDiagnosis,
  type DeaiFitType,
} from "@/lib/deai-fit";

type DeaiFitStage = "intro" | "question" | "result";

const analyzingDelayMs = 240;

export function DeaiFitApp() {
  const [stage, setStage] = useState<DeaiFitStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DeaiFitType[]>([]);
  const [selectedType, setSelectedType] = useState<DeaiFitType | null>(null);

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
  }, [stage]);

  const handleStart = () => {
    trackEvent("diagnosis_start", {
      quiz_name: "deai_fit",
    });
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedType(null);
    setStage("question");
  };

  const handleRestart = () => {
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedType(null);
    setStage("intro");
  };

  const handleBack = () => {
    if (selectedType !== null || questionIndex === 0) {
      return;
    }

    setAnswers((current) => current.slice(0, -1));
    setQuestionIndex((current) => current - 1);
  };

  const handleSelect = (type: DeaiFitType) => {
    if (selectedType !== null) {
      return;
    }

    const nextAnswers = [...answers, type];
    setSelectedType(type);

    trackEvent("question_answered", {
      quiz_name: "deai_fit",
      question_id: question.id,
      answer_type: type,
      progress: questionIndex + 1,
    });

    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelectedType(null);

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
            AIKATA DIAGNOSIS
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
            自分に合う出会い方診断
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
            マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場。
            あなたの恋愛スタイルに合う出会い方を、10問で整理します。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="tag">全10問</span>
            <span className="tag">約2分</span>
            <span className="tag">無料</span>
            <span className="tag">採点ではなく自己理解</span>
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
              条件検索、関係性育成、生活圏拡張、価値観発信、併用設計の5タイプから、今のあなたが動きやすい出会い方を返します。
            </p>
          </section>
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">アイカタの考え方</p>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              普通の婚活に、自分を合わせなくていい。いい相方に出会うには、自分に合う会い方がいる。
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
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={questionIndex === 0 || selectedType !== null}
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
            <h1 className="mt-4 text-[1.55rem] font-black leading-[1.65] text-[var(--color-text)] sm:text-[2rem]">
              {question.text}
            </h1>
            <div className="mt-7 grid gap-3">
              {question.options.map((option) => {
                const isSelected = selectedType === option.type;

                return (
                  <button
                    key={`${question.id}-${option.type}`}
                    type="button"
                    onClick={() => handleSelect(option.type)}
                    disabled={selectedType !== null}
                    className={`choice-button rounded-[1.1rem] border px-4 py-4 text-left text-sm font-bold leading-7 transition sm:text-base ${
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

  return (
    <section data-testid="deai-fit-result" className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          RESULT
        </p>
        <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          あなたは、
          <span className="block text-[var(--accent)]">{result.name}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-8 text-[var(--text-sub)] sm:text-base">
          {result.proposal}
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="soft-panel rounded-[1.6rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">向いている出会い方</p>
            <ul className="mt-4 grid gap-3">
              {result.suited.map((item) => (
                <li key={item} className="rounded-[1rem] bg-[rgba(143,183,161,0.12)] px-4 py-3 text-sm font-bold leading-7 text-[var(--text-main)]">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="soft-panel rounded-[1.6rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">合わない出会い方</p>
            <ul className="mt-4 grid gap-3">
              {result.notFit.map((item) => (
                <li key={item} className="rounded-[1rem] bg-[rgba(201,130,120,0.1)] px-4 py-3 text-sm leading-7 text-[var(--text-main)]">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="soft-panel rounded-[1.6rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">婚活で消耗しやすいポイント</p>
            <ul className="mt-4 grid gap-3">
              {result.drain.map((item) => (
                <li key={item} className="rounded-[1rem] bg-white/84 px-4 py-3 text-sm leading-7 text-[var(--text-main)]">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="soft-panel rounded-[1.6rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">今日から試す行動</p>
            <p className="mt-4 text-sm font-bold leading-8 text-[var(--text-main)] sm:text-base">{result.action}</p>
          </section>
        </div>

        <section className="soft-panel mt-6 rounded-[1.6rem] p-5 sm:p-6">
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">スコア内訳</p>
          <div className="mt-4 grid gap-3">
            {DEAI_FIT_TYPE_ORDER.map((type) => (
              <div key={type} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="font-bold text-[var(--text-main)]">{DEAI_FIT_RESULTS[type].name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-[rgba(63,52,46,0.1)]">
                  <span
                    className="block h-full rounded-full bg-[var(--color-main)]"
                    style={{ width: `${Math.round((scores[type] / DEAI_FIT_QUESTIONS.length) * 100)}%` }}
                  />
                </span>
                <span className="font-numeric font-black text-[var(--text-main)]">{scores[type]}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 rounded-[1.2rem] border border-[rgba(63,52,46,0.1)] bg-white/80 px-5 py-4 text-sm leading-8 text-[var(--text-sub)]">
          診断は、あなたを採点するためのものではありません。自分に合わない頑張り方を見直し、自分に合う出会い方を知るための入口です。
        </p>

        <AikataConsultationCta className="mt-6" />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={handleRestart} className="btn-secondary rounded-[1rem] px-5 py-3 text-sm font-bold">
            もう一度診断する
          </button>
        </div>
      </div>
    </section>
  );
}
