"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProfResultScreen } from "@/components/prof/ProfResultScreen";
import { trackEvent } from "@/lib/analytics";
import {
  isAnalysisResult,
  isBaseAnalysisResult,
  serializeProfShareParams,
  type AnalyzeRequest,
  type DetailAnalysisResult,
  type PartialAnalysisResult,
} from "@/lib/prof";

type DetailStatus = "idle" | "loading" | "error" | "done";

type StoredProfResult = {
  query?: string;
  form?: AnalyzeRequest;
  result?: PartialAnalysisResult;
  detailStatus?: DetailStatus;
  analysisToken?: string | null;
};

const PROF_RESULT_STORAGE_KEY = "shindanlab-prof-result";

export function ProfResultPageClient({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const requestIdRef = useRef(0);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [form, setForm] = useState<AnalyzeRequest | null>(null);
  const [result, setResult] = useState<PartialAnalysisResult | null>(null);
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const [analysisToken, setAnalysisToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawStored = window.sessionStorage.getItem(PROF_RESULT_STORAGE_KEY);
    if (!rawStored) {
      setCheckedStorage(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawStored) as StoredProfResult;
      if (parsed.query === currentQuery && parsed.form && parsed.result && isBaseAnalysisResult(parsed.result)) {
        setForm(parsed.form);
        setResult(parsed.result);
        setDetailStatus(parsed.detailStatus ?? "idle");
        setAnalysisToken(parsed.analysisToken ?? null);
      }
    } catch (storageError) {
      console.error(storageError);
    } finally {
      setCheckedStorage(true);
    }
  }, [currentQuery]);

  useEffect(() => {
    if (typeof window === "undefined" || !form || !result) {
      return;
    }

    const improvedTotal = "improvedProfile" in result && result.improvedProfile?.estimatedScores
      ? result.improvedProfile.estimatedScores.total
      : null;
    const nextQuery = serializeProfShareParams(result.scores, improvedTotal, result.nickname);

    if (currentQuery !== nextQuery) {
      router.replace(`/prof/result?${nextQuery}`, { scroll: false });
    }

    window.sessionStorage.setItem(
      PROF_RESULT_STORAGE_KEY,
      JSON.stringify({
        query: nextQuery,
        form,
        result,
        detailStatus,
        analysisToken,
      } satisfies StoredProfResult)
    );
  }, [analysisToken, currentQuery, detailStatus, form, result, router]);

  useEffect(() => {
    if (!form || !result || !analysisToken || detailStatus !== "loading" || isAnalysisResult(result)) {
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    const fetchDetails = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            mode: "details",
            analysisToken,
          }),
        });

        const json = (await response.json()) as DetailAnalysisResult & { error?: string };

        if (requestIdRef.current !== requestId) {
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
          initial_total_hensachi: result.scores.total,
          score_diff: json.improvedProfile.estimatedScores.total - result.scores.total,
        });
      } catch (detailError) {
        if (requestIdRef.current !== requestId) {
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

    void fetchDetails();
  }, [analysisToken, detailStatus, form, result]);

  const handleRetryDetails = () => {
    if (!analysisToken) {
      setDetailStatus("error");
      return;
    }

    trackEvent("detail_retry_click", {
      quiz_name: "prof_hensachi",
      total_hensachi: result?.scores.total ?? null,
    });
    setDetailStatus("loading");
  };

  const handleRestart = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(PROF_RESULT_STORAGE_KEY);
    }
    router.replace("/prof", { scroll: false });
  };

  if (!checkedStorage) {
    return null;
  }

  if (form && result) {
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

  return <>{fallback}</>;
}
