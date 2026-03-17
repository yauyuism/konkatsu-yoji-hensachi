"use client";

import { useEffect, useRef, useState } from "react";

import { questions } from "@/data/questions";
import { trackEvent } from "@/lib/analytics";
import { diagnoseAnswers } from "@/lib/diagnosis";
import { getResultUrl } from "@/lib/share";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { IntroScreen } from "@/components/IntroScreen";
import { QuestionScreen } from "@/components/QuestionScreen";
import { ResultScreen } from "@/components/ResultScreen";

type DiagnosisStage = "intro" | "question" | "analyzing" | "result";

type DiagnosisAppProps = {
  initialStage?: DiagnosisStage;
};

const analyzingPhases = [
  "筆を取っています",
  "墨を磨っています",
  "四字を選んでいます",
  "落款を押しています",
];

async function saveYojiStats(answerIndexes: number[]) {
  await fetch("/api/yoji-stats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answerIndexes,
    }),
  });
}

export function DiagnosisApp({ initialStage = "intro" }: DiagnosisAppProps) {
  const [stage, setStage] = useState<DiagnosisStage>(initialStage);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [answerIndexes, setAnswerIndexes] = useState<number[]>([]);
  const [completedAnswerIndexes, setCompletedAnswerIndexes] = useState<number[]>([]);
  const [analysisPhaseIndex, setAnalysisPhaseIndex] = useState(0);
  const [diagnosis, setDiagnosis] = useState<ReturnType<typeof diagnoseAnswers> | null>(null);
  const hasTrackedStartRef = useRef(false);
  const savedStatKeysRef = useRef(new Set<string>());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage, questionIndex]);

  useEffect(() => {
    if (stage !== "question" || hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
    trackEvent("diagnosis_start", {
      quiz_name: "konkatsu_yoji",
      entry_stage: initialStage,
    });
  }, [initialStage, stage]);

  useEffect(() => {
    if (stage !== "analyzing" || !diagnosis) {
      return;
    }

    const phaseTimers = analyzingPhases.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setAnalysisPhaseIndex(index + 1);
      }, (index + 1) * 850)
    );

    const completeTimer = window.setTimeout(() => {
      trackEvent("diagnosis_complete", {
        quiz_name: "konkatsu_yoji",
        result_type: diagnosis.type,
      });
      setStage("result");
    }, 3400);

    return () => {
      phaseTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completeTimer);
    };
  }, [diagnosis, stage]);

  useEffect(() => {
    if (stage !== "result" || !diagnosis || completedAnswerIndexes.length !== questions.length) {
      return;
    }

    const key = completedAnswerIndexes.join("");
    if (savedStatKeysRef.current.has(key)) {
      return;
    }

    savedStatKeysRef.current.add(key);
    void saveYojiStats(completedAnswerIndexes).catch(() => {
      savedStatKeysRef.current.delete(key);
    });
  }, [completedAnswerIndexes, diagnosis, stage]);

  const startDiagnosis = () => {
    hasTrackedStartRef.current = false;
    setQuestionIndex(0);
    setSelectedChoiceIndex(null);
    setAnswerIndexes([]);
    setCompletedAnswerIndexes([]);
    setDiagnosis(null);
    setAnalysisPhaseIndex(0);
    setStage("question");
  };

  const restartDiagnosis = () => {
    hasTrackedStartRef.current = false;
    setQuestionIndex(0);
    setSelectedChoiceIndex(null);
    setAnswerIndexes([]);
    setCompletedAnswerIndexes([]);
    setDiagnosis(null);
    setAnalysisPhaseIndex(0);
    setStage(initialStage === "question" ? "question" : "intro");
  };

  const handleSelectChoice = (choiceIndex: number) => {
    if (selectedChoiceIndex !== null) {
      return;
    }

    const question = questions[questionIndex];
    const nextAnswers = [...answerIndexes];
    nextAnswers[questionIndex] = choiceIndex;

    setSelectedChoiceIndex(choiceIndex);
    setAnswerIndexes(nextAnswers);

    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
      window.navigator.vibrate(12);
    }

    trackEvent("question_answered", {
      quiz_name: "konkatsu_yoji",
      question_id: question.id,
      choice_index: choiceIndex,
      progress: questionIndex + 1,
    });

    window.setTimeout(() => {
      setSelectedChoiceIndex(null);

      if (questionIndex === questions.length - 1) {
        setCompletedAnswerIndexes(nextAnswers);
        setDiagnosis(diagnoseAnswers(nextAnswers));
        setAnalysisPhaseIndex(0);
        setStage("analyzing");
        return;
      }

      setQuestionIndex((current) => current + 1);
    }, 420);
  };

  const handleBack = () => {
    if (questionIndex === 0 || selectedChoiceIndex !== null) {
      return;
    }

    setQuestionIndex((current) => Math.max(0, current - 1));
  };

  if (stage === "intro") {
    return <IntroScreen onStart={startDiagnosis} />;
  }

  if (stage === "question") {
    return (
      <QuestionScreen
        question={questions[questionIndex]}
        questionIndex={questionIndex}
        totalQuestions={questions.length}
        currentChoiceIndex={answerIndexes[questionIndex] ?? null}
        selectedChoiceIndex={selectedChoiceIndex}
        canGoBack={questionIndex > 0}
        onBack={handleBack}
        onSelect={handleSelectChoice}
      />
    );
  }

  if (stage === "analyzing") {
    return <AnalyzingScreen phaseText={analyzingPhases[analysisPhaseIndex]} />;
  }

  if (!diagnosis) {
    return null;
  }

  return (
    <ResultScreen
      result={diagnosis.result}
      resultUrl={getResultUrl(diagnosis.type)}
      onRestart={restartDiagnosis}
    />
  );
}
