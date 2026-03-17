"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { InputForm } from "@/components/prof/InputForm";
import { ProfAnalyzingScreen } from "@/components/prof/ProfAnalyzingScreen";
import { ProfResultScreen } from "@/components/prof/ProfResultScreen";
import { trackEvent } from "@/lib/analytics";
import {
  buildProfileCoachComment,
  buildProfileSummary,
  isBaseAnalysisResult,
  parseProfShareParams,
  serializeProfShareParams,
  type AnalyzeRequest,
  type BaseAnalysisResult,
  type DetailAnalysisResult,
  type PartialAnalysisResult,
} from "@/lib/prof";

const initialForm: AnalyzeRequest = {
  gender: "male",
  age: 28,
  apps: ["pairs"],
  profileText: "",
};

type DetailStatus = "idle" | "loading" | "error" | "done";
const PROF_RESULT_STORAGE_KEY = "shindanlab-prof-result";

export function ProfApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);
  const activeRequestIdRef = useRef(0);
  const analyzeStartedAtRef = useRef<number | null>(null);
  const detailStartedAtRef = useRef<number | null>(null);
  const [form, setForm] = useState<AnalyzeRequest>(initialForm);
  const [result, setResult] = useState<PartialAnalysisResult | null>(null);
  const [analysisToken, setAnalysisToken] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const currentQuery = searchParams.toString();

  useEffect(() => {
    if (typeof window === "undefined" || result || isAnalyzing || !currentQuery) {
      return;
    }

    const rawStored = window.sessionStorage.getItem(PROF_RESULT_STORAGE_KEY);
    if (rawStored) {
      try {
        const parsed = JSON.parse(rawStored) as {
          query?: string;
          form?: AnalyzeRequest;
          result?: PartialAnalysisResult;
          detailStatus?: DetailStatus;
          analysisToken?: string | null;
        };

        if (parsed.query === currentQuery && parsed.result && isBaseAnalysisResult(parsed.result)) {
          activeRequestIdRef.current += 1;
          setForm(parsed.form ?? initialForm);
          setResult(parsed.result);
          setDetailStatus(parsed.detailStatus ?? "idle");
          setAnalysisToken(parsed.analysisToken ?? null);
          return;
        }
      } catch (storageError) {
        console.error(storageError);
      }
    }

    const restored = parseProfShareParams(Object.fromEntries(searchParams.entries()));
    if (!restored.scores.total) {
      return;
    }

    const minimalResult: PartialAnalysisResult = {
      scores: restored.scores,
      title: restored.titleMeta.title,
      nickname: restored.nickname,
      axisComments: restored.axisComments,
      summary: buildProfileSummary({
        scores: restored.scores,
        highlights: { good: [], bad: [] },
      }),
      highlights: { good: [], bad: [] },
      comment: buildProfileCoachComment({
        scores: restored.scores,
        highlights: { good: [], bad: [] },
      }),
    };

    setResult(minimalResult);
    setDetailStatus("idle");
  }, [currentQuery, isAnalyzing, result, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!result) {
      return;
    }

    const improvedTotal = "improvedProfile" in result && result.improvedProfile?.estimatedScores
      ? result.improvedProfile.estimatedScores.total
      : null;
    const query = serializeProfShareParams(result.scores, improvedTotal, result.nickname);

    window.sessionStorage.setItem(
      PROF_RESULT_STORAGE_KEY,
      JSON.stringify({
        query,
        form,
        result,
        detailStatus,
        analysisToken,
      })
    );
  }, [analysisToken, detailStatus, form, result]);

  const fetchDetails = async (
    value: AnalyzeRequest,
    token: string,
    requestId: number,
    baseResult: BaseAnalysisResult
  ) => {
    setDetailStatus("loading");
    detailStartedAtRef.current = Date.now();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...value,
          mode: "details",
          analysisToken: token,
        }),
      });

      const json = (await response.json()) as DetailAnalysisResult & { error?: string };

      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      if (!response.ok) {
        throw new Error(json.error ?? "詳細分析に失敗しました");
      }

      setResult((current) => (current ? { ...current, ...json } : current));
      setDetailStatus("done");
      trackEvent("diagnosis_complete", {
        quiz_name: "prof_hensachi",
        total_hensachi: json.improvedProfile.estimatedScores.total,
        initial_total_hensachi: baseResult.scores.total,
        latency_ms: analyzeStartedAtRef.current ? Date.now() - analyzeStartedAtRef.current : null,
        detail_latency_ms: detailStartedAtRef.current ? Date.now() - detailStartedAtRef.current : null,
        score_diff: json.improvedProfile.estimatedScores.total - baseResult.scores.total,
      });
    } catch (detailError) {
      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      console.error(detailError);
      setDetailStatus("error");
      trackEvent("analysis_error", {
        quiz_name: "prof_hensachi",
        stage: "details",
        message: detailError instanceof Error ? detailError.message : "details_failed",
      });
    }
  };

  const handleSubmit = async (value: AnalyzeRequest) => {
    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;
    analyzeStartedAtRef.current = Date.now();
    detailStartedAtRef.current = null;

    setError(null);
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisToken(null);
    setDetailStatus("idle");
    trackEvent("diagnosis_start", {
      quiz_name: "prof_hensachi",
      gender: value.gender,
      age: value.age,
      apps_count: value.apps.length,
      profile_length: value.profileText.trim().length,
    });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...value,
          mode: "initial",
        }),
      });

      const json = (await response.json()) as (BaseAnalysisResult & { analysisToken?: string; error?: string });

      if (!response.ok) {
        throw new Error(json.error ?? "分析に失敗しました");
      }

      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      setResult(json);
      setAnalysisToken(json.analysisToken ?? null);
      setDetailStatus(json.analysisToken ? "loading" : "idle");
      setIsAnalyzing(false);
      trackEvent("diagnosis_initial_complete", {
        quiz_name: "prof_hensachi",
        total_hensachi: json.scores.total,
        latency_ms: analyzeStartedAtRef.current ? Date.now() - analyzeStartedAtRef.current : null,
      });
      const initialQuery = serializeProfShareParams(json.scores, null, json.nickname);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          PROF_RESULT_STORAGE_KEY,
          JSON.stringify({
            query: initialQuery,
            form: value,
            result: json,
            detailStatus: json.analysisToken ? "loading" : "idle",
            analysisToken: json.analysisToken ?? null,
          })
        );
      }
      router.replace(`/prof/result?${initialQuery}`, { scroll: false });
    } catch (submitError) {
      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      setError(submitError instanceof Error ? submitError.message : "分析に失敗しました");
      setIsAnalyzing(false);
      trackEvent("analysis_error", {
        quiz_name: "prof_hensachi",
        stage: "initial",
        message: submitError instanceof Error ? submitError.message : "initial_failed",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRetryDetails = () => {
    if (!result) {
      return;
    }

    const requestId = activeRequestIdRef.current;
    if (!analysisToken) {
      setDetailStatus("error");
      return;
    }

    trackEvent("detail_retry_click", {
      quiz_name: "prof_hensachi",
      total_hensachi: result.scores.total,
    });
    void fetchDetails(form, analysisToken, requestId, result);
  };

  const handleRestart = () => {
    activeRequestIdRef.current += 1;
    setResult(null);
    setAnalysisToken(null);
    setError(null);
    setDetailStatus("idle");
    setIsAnalyzing(false);
    analyzeStartedAtRef.current = null;
    detailStartedAtRef.current = null;
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(PROF_RESULT_STORAGE_KEY);
    }
    router.replace("/prof", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isAnalyzing) {
    return <ProfAnalyzingScreen />;
  }

  if (result) {
    return (
      <ProfResultScreen
        result={result}
        originalProfile={form.profileText}
        selectedApps={form.apps}
        detailStatus={detailStatus}
        onRetryDetails={handleRetryDetails}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <section data-testid="prof-page" className="screen-shell relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <div className="absolute left-[-4rem] top-10 h-48 w-48 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-28 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.1)] blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="eyebrow inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
            PROFILE CHECK
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
            あなたのプロフ、
            <span className="block text-[var(--accent)]">異性からどう見えてる？</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            マッチングアプリのプロフィール文を貼るだけ。AIが5つの観点でスコア化し、ダメな箇所と改善案までまとめて返します。
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-[var(--text-sub)]">
            <span className="soft-pill rounded-full px-4 py-2">無料</span>
            <span className="soft-pill rounded-full px-4 py-2">登録不要</span>
            <span className="soft-pill rounded-full px-4 py-2">約30秒</span>
            <span className="soft-pill rounded-full px-4 py-2">保存なし</span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              data-testid="prof-hero-cta"
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="cta-button inline-flex items-center justify-center rounded-[1.35rem] px-7 py-4 text-base font-black text-white"
            >
              プロフを貼って診断する ↓
            </button>
          </div>
      </div>

      <div ref={formRef} className="mx-auto mt-10 max-w-4xl">
        <InputForm value={form} onChange={setForm} onSubmit={handleSubmit} isSubmitting={isAnalyzing} error={error} />
      </div>
    </section>
  );
}
