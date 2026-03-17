"use client";

import { useEffect, useRef, useState } from "react";

import { HensachiAnalyzingScreen } from "@/components/hensachi/HensachiAnalyzingScreen";
import { HensachiIntroScreen } from "@/components/hensachi/HensachiIntroScreen";
import { HensachiResultScreen } from "@/components/hensachi/HensachiResultScreen";
import { QuestionScreen } from "@/components/QuestionScreen";
import { hensachiQuestions } from "@/data/hensachi-questions";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import { diagnoseHensachiAnswers } from "@/lib/hensachi";
import { getHensachiResultUrl } from "@/lib/hensachi-share";

type HensachiStage = "intro" | "question" | "analyzing" | "result";

const analyzingPhases = ["回答を分析中", "偏差値を算出中", "称号を決定中", "成績表を作成中"];

type HensachiAppProps = {
  skipIntro?: boolean;
};

async function saveHensachiStats(answerIndexes: number[]) {
  await fetch("/api/hensachi-stats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answerIndexes,
    }),
  });
}

export function HensachiApp({ skipIntro = false }: HensachiAppProps) {
  const [stage, setStage] = useState<HensachiStage>(skipIntro ? "question" : "intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [answerIndexes, setAnswerIndexes] = useState<Array<number | null>>(() => Array(hensachiQuestions.length).fill(null));
  const [analysisPhaseIndex, setAnalysisPhaseIndex] = useState(0);
  const [diagnosis, setDiagnosis] = useState<ReturnType<typeof diagnoseHensachiAnswers> | null>(null);
  const hasTrackedStartRef = useRef(false);
  const savedStatKeysRef = useRef(new Set<string>());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIndex, stage]);

  useEffect(() => {
    if (stage !== "question" || hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
    trackEvent("diagnosis_start", {
      quiz_name: "app_hensachi",
      entry_stage: skipIntro ? "skip_intro" : "intro",
    });
  }, [skipIntro, stage]);

  useEffect(() => {
    if (stage !== "analyzing" || !diagnosis) {
      return;
    }

    const phaseTimers = analyzingPhases.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setAnalysisPhaseIndex(index + 1);
      }, (index + 1) * 900)
    );

    const completeTimer = window.setTimeout(() => {
      trackEvent("diagnosis_complete", {
        quiz_name: "app_hensachi",
        result_title: diagnosis.title,
        total_hensachi: diagnosis.totalHensachi,
      });
      setStage("result");
    }, 3600);

    return () => {
      phaseTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completeTimer);
    };
  }, [diagnosis, stage]);

  useEffect(() => {
    if (stage !== "result") {
      return;
    }

    markToolCompleted("hensachi");
  }, [stage]);

  useEffect(() => {
    if (stage !== "result" || !diagnosis?.answerIndexes) {
      return;
    }

    const key = diagnosis.answerSignature ?? diagnosis.answerIndexes.join("");
    if (savedStatKeysRef.current.has(key)) {
      return;
    }

    savedStatKeysRef.current.add(key);
    void saveHensachiStats(diagnosis.answerIndexes).catch(() => {
      savedStatKeysRef.current.delete(key);
    });
  }, [diagnosis, stage]);

  const resetDiagnosis = (nextStage: HensachiStage) => {
    hasTrackedStartRef.current = false;
    setQuestionIndex(0);
    setSelectedChoiceIndex(null);
    setAnswerIndexes(Array(hensachiQuestions.length).fill(null));
    setDiagnosis(null);
    setAnalysisPhaseIndex(0);
    setStage(nextStage);
  };

  const handleStart = () => {
    resetDiagnosis("question");
  };

  const handleRestart = () => {
    resetDiagnosis("intro");
  };

  const handleGoBack = () => {
    if (selectedChoiceIndex !== null || questionIndex === 0) {
      return;
    }

    setQuestionIndex((current) => current - 1);
  };

  const handleSelectChoice = (choiceIndex: number) => {
    if (selectedChoiceIndex !== null) {
      return;
    }

    const question = hensachiQuestions[questionIndex];
    const nextAnswers = [...answerIndexes];
    nextAnswers[questionIndex] = choiceIndex;

    setSelectedChoiceIndex(choiceIndex);
    setAnswerIndexes(nextAnswers);

    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
      window.navigator.vibrate(12);
    }

    trackEvent("question_answered", {
      quiz_name: "app_hensachi",
      question_id: question.id,
      choice_index: choiceIndex,
      progress: questionIndex + 1,
    });

    window.setTimeout(() => {
      setSelectedChoiceIndex(null);

      if (questionIndex === hensachiQuestions.length - 1) {
        const completedAnswers = nextAnswers.map((answer) => answer ?? 0);
        setDiagnosis(diagnoseHensachiAnswers(completedAnswers));
        setAnalysisPhaseIndex(0);
        setStage("analyzing");
        return;
      }

      setQuestionIndex((current) => current + 1);
    }, 420);
  };

  if (stage === "intro") {
    return <HensachiIntroScreen onStart={handleStart} />;
  }

  if (stage === "question") {
    return (
      <QuestionScreen
        question={hensachiQuestions[questionIndex]}
        questionIndex={questionIndex}
        totalQuestions={hensachiQuestions.length}
        currentChoiceIndex={answerIndexes[questionIndex] ?? null}
        selectedChoiceIndex={selectedChoiceIndex}
        canGoBack={questionIndex > 0}
        onBack={handleGoBack}
        onSelect={handleSelectChoice}
      />
    );
  }

  if (stage === "analyzing" && diagnosis) {
    return (
      <HensachiAnalyzingScreen
        phaseText={analyzingPhases[analysisPhaseIndex]}
        targetTotal={diagnosis.totalHensachi}
      />
    );
  }

  if (!diagnosis) {
    return null;
  }

  return (
    <HensachiResultScreen
      result={diagnosis}
      resultUrl={getHensachiResultUrl(diagnosis)}
      onRestart={handleRestart}
    />
  );
}
