"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { ConfidenceWarning } from "@/components/weight/ConfidenceWarning";
import { CrossPromotion } from "@/components/CrossPromotion";
import { SituationSelector } from "@/components/weight/SituationSelector";
import { UnifiedInput } from "@/components/weight/UnifiedInput";
import { WeightAnalyzingScreen } from "@/components/weight/WeightAnalyzingScreen";
import { WeightResultScreen } from "@/components/weight/WeightResultScreen";
import { calculateWeight } from "@/lib/weight-calculator";
import { resizeImageFile } from "@/lib/image-resizer";
import { estimateMessageCount } from "@/lib/message-parser";
import { getComment } from "@/lib/situation-judgment";
import { trackEvent } from "@/lib/analytics";
import { getWeightLineShareUrl, getWeightXShareUrl, type WeightSharePayload } from "@/lib/weight-share";
import type {
  AnalyzeWeightResponse,
  WeightGender,
  WeightInputMode,
  WeightResult,
  WeightSourceMeta,
} from "@/lib/weight-types";
import type { Situation } from "@/data/weight";

const MAX_INPUT_LENGTH = 10000;
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TEXT_ANALYZING_PHASES = ["メッセージを分析中", "構造を解析中", "重量を計算中"];
const IMAGE_ANALYZING_PHASES = ["スクショを読み取り中", "メッセージを抽出中", "重量を計算中"];

type LoadedResult = {
  situation: Situation;
  analysis: AnalyzeWeightResponse;
  sourceMeta: WeightSourceMeta;
  result: WeightResult;
  comment: string;
};

type PendingLowConfidence = {
  situation: Situation;
  analysis: AnalyzeWeightResponse;
};

async function saveWeightStats(payload: {
  gender: WeightGender;
  situation: Situation;
  result: WeightResult;
  sourceMeta: WeightSourceMeta;
  messageCount: number;
}) {
  await fetch("/api/weight-stats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gender: payload.gender,
      situation: payload.situation,
      inputMode: payload.sourceMeta.inputMode,
      confidence: payload.sourceMeta.confidence,
      imageCount: payload.sourceMeta.imageCount,
      totalWeight: payload.result.totalWeight,
      partnerWeight: payload.result.partnerWeight,
      weightDiff: payload.result.weightDiff,
      judgment: payload.result.judgment,
      breakdown: payload.result.breakdown,
      messageCount: payload.messageCount,
    }),
  });
}

function buildSourceMeta(analysis: AnalyzeWeightResponse): WeightSourceMeta {
  return {
    inputMode: analysis.inputMode,
    confidence: analysis.confidence,
    imageCount: analysis.imageCount,
    myMessageCount: analysis.conversationSummary.myMessageCount,
    theirMessageCount: analysis.conversationSummary.theirMessageCount,
  };
}

export function WeightApp() {
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const savedStatKeysRef = useRef(new Set<string>());
  const [gender, setGender] = useState<WeightGender | null>(null);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [inputMode, setInputMode] = useState<"idle" | WeightInputMode>("idle");
  const [inputText, setInputText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingImages, setIsPreparingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedResult, setLoadedResult] = useState<LoadedResult | null>(null);
  const [pendingLowConfidence, setPendingLowConfidence] = useState<PendingLowConfidence | null>(null);
  const deferredInputText = useDeferredValue(inputText);

  const messageCount = useMemo(() => estimateMessageCount(deferredInputText), [deferredInputText]);
  const activePhases = inputMode === "images" ? IMAGE_ANALYZING_PHASES : TEXT_ANALYZING_PHASES;
  const canSubmit = Boolean(
    gender &&
      situation &&
      !isPreparingImages &&
      ((inputMode === "images" && imageFiles.length > 0) ||
        (inputMode === "text" && inputText.trim().length >= 20 && inputText.trim().length <= MAX_INPUT_LENGTH))
  );

  useEffect(() => {
    if (!isSubmitting) {
      setPhaseIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setPhaseIndex((current) => (current < activePhases.length - 1 ? current + 1 : current));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activePhases.length, isSubmitting]);

  useEffect(() => {
    if (!loadedResult) {
      return;
    }

    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loadedResult]);

  useEffect(() => {
    if (!loadedResult || !gender) {
      return;
    }

    const key = [
      gender,
      loadedResult.situation,
      loadedResult.sourceMeta.inputMode,
      loadedResult.sourceMeta.confidence,
      loadedResult.result.totalWeight.toFixed(1),
      loadedResult.result.partnerWeight.toFixed(1),
      loadedResult.sourceMeta.myMessageCount,
      loadedResult.sourceMeta.theirMessageCount,
    ].join(":");

    if (savedStatKeysRef.current.has(key)) {
      return;
    }

    savedStatKeysRef.current.add(key);
    void saveWeightStats({
      gender,
      situation: loadedResult.situation,
      result: loadedResult.result,
      sourceMeta: loadedResult.sourceMeta,
      messageCount: loadedResult.sourceMeta.myMessageCount + loadedResult.sourceMeta.theirMessageCount,
    }).catch(() => {
      savedStatKeysRef.current.delete(key);
    });
  }, [gender, loadedResult]);

  const switchToImages = () => {
    setInputMode("images");
    setError(null);
  };

  const switchToText = () => {
    setInputMode("text");
    setPendingLowConfidence(null);
    setError(null);
  };

  const handleTextChange = (value: string) => {
    setInputMode("text");
    setInputText(value);
    setError(null);
  };

  const handleTextPaste = (value: string) => {
    setInputMode("text");
    setInputText((current) => (current.trim().length > 0 ? `${current}\n${value}` : value));
    setError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPendingLowConfidence(null);
    setError(null);
  };

  const handleAddImages = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const remainingCount = MAX_IMAGE_COUNT - imageFiles.length;
    if (remainingCount <= 0) {
      setError("スクショは最大5枚までです。");
      return;
    }

    const selectedFiles = files.slice(0, remainingCount);
    setIsPreparingImages(true);
    setError(null);

    try {
      const preparedFiles: File[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error("画像ファイルだけ追加できます。");
        }

        const resizedFile = await resizeImageFile(file);
        if (resizedFile.size > MAX_IMAGE_BYTES) {
          throw new Error("画像は1枚5MB以下にしてください。");
        }

        preparedFiles.push(resizedFile);
      }

      setImageFiles((current) => [...current, ...preparedFiles].slice(0, MAX_IMAGE_COUNT));
      setInputMode("images");
      setPendingLowConfidence(null);
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "画像の準備に失敗しました");
    } finally {
      setIsPreparingImages(false);
    }
  };

  const finalizeAnalysis = (analysis: AnalyzeWeightResponse, nextSituation: Situation) => {
    const myMessages = analysis.messages.filter((message) => message.isMine);
    const theirMessages = analysis.messages.filter((message) => !message.isMine);

    if (myMessages.length === 0 || theirMessages.length === 0) {
      throw new Error("自分と相手のメッセージを分けて読み取れませんでした。");
    }

    const result = calculateWeight(myMessages, theirMessages, nextSituation);
    const comment = getComment(nextSituation, result.totalWeight, result.partnerWeight, result.topFactor);

    setLoadedResult({
      situation: nextSituation,
      analysis,
      sourceMeta: buildSourceMeta(analysis),
      result,
      comment,
    });
    setPendingLowConfidence(null);
  };

  const handleSubmit = async () => {
    if (!gender) {
      setError("あなたの性別を選んでください。");
      return;
    }

    if (!situation) {
      setError("相手との関係を選んでください。");
      return;
    }

    if (inputMode === "images" && imageFiles.length === 0) {
      setError("スクショを1枚以上追加してください。");
      return;
    }

    if (inputMode !== "images" && inputText.trim().length < 20) {
      setError("テキストは20文字以上ほしいです。");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setLoadedResult(null);
    setPendingLowConfidence(null);

    trackEvent("weight_submit", {
      quiz_name: "message_weight",
      gender,
      situation,
      input_mode: inputMode,
      image_count: inputMode === "images" ? imageFiles.length : 0,
      message_count_estimate: inputMode === "text" ? messageCount : undefined,
      input_length: inputMode === "text" ? inputText.trim().length : undefined,
    });

    try {
      const formData = new FormData();
      formData.append("gender", gender);
      formData.append("inputMode", inputMode === "images" ? "images" : "text");

      if (inputMode === "images") {
        for (const file of imageFiles) {
          formData.append("images", file);
        }
      } else {
        formData.append("text", inputText.trim());
      }

      const response = await fetch("/api/analyze-weight", {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as AnalyzeWeightResponse | { error?: string };
      if (!response.ok) {
        throw new Error("error" in body && typeof body.error === "string" ? body.error : "分析に失敗しました");
      }

      const analysis = body as AnalyzeWeightResponse;

      if (analysis.inputMode === "images" && analysis.confidence === "low") {
        setPendingLowConfidence({
          situation,
          analysis,
        });
        return;
      }

      finalizeAnalysis(analysis, situation);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "分析に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setInputMode("idle");
    setInputText("");
    setImageFiles([]);
    setLoadedResult(null);
    setPendingLowConfidence(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sharePayload: WeightSharePayload | null = loadedResult
    ? {
        situation: loadedResult.situation,
        totalWeight: loadedResult.result.totalWeight,
        partnerWeight: loadedResult.result.partnerWeight,
        messageCount: loadedResult.sourceMeta.myMessageCount + loadedResult.sourceMeta.theirMessageCount,
        myMessageCount: loadedResult.sourceMeta.myMessageCount,
        theirMessageCount: loadedResult.sourceMeta.theirMessageCount,
        inputMode: loadedResult.sourceMeta.inputMode,
        confidence: loadedResult.sourceMeta.confidence,
        imageCount: loadedResult.sourceMeta.imageCount,
        breakdown: loadedResult.result.breakdown,
        analysisComment: loadedResult.analysis.comment,
      }
    : null;

  return (
    <section className="screen-shell relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="absolute left-[-4rem] top-10 h-44 w-44 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-28 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.1)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="paper-card rounded-[2.2rem] border border-[color:var(--line)] bg-[var(--card)] p-6 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-8">
          <p className="eyebrow inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
            MESSAGE WEIGHT
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
            あなたのLINE、
            <span className="block text-[var(--accent)]">重い？軽い？</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            やりとりのスクショを貼るだけ。メッセージの重さをkg単位で測定します。
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-sub)]">
            {["無料", "登録不要", "保存なし"].map((item) => (
              <span key={item} className="soft-pill rounded-full px-4 py-2">
                {item}
              </span>
            ))}
          </div>

          <a
            href="#weight-form"
            className="cta-button mt-8 inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-white"
          >
            スクショを貼って測定する ↓
          </a>
        </div>

        <div id="weight-form" ref={formRef} className="mt-6">
          <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
            <div className="grid gap-8">
              <section>
                <h2 className="text-xl font-black text-[var(--text-main)]">あなたの性別</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "male", label: "男性" },
                    { value: "female", label: "女性" },
                  ].map((option) => {
                    const active = gender === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value as WeightGender)}
                        className={`choice-button rounded-[1.2rem] border px-4 py-4 text-sm font-black transition ${
                          active
                            ? "border-[rgba(232,69,60,0.24)] bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "border-[rgba(26,26,26,0.08)] bg-white/88 text-[var(--text-main)]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-[var(--text-main)]">この相手との関係で、一番近いのはどれ？</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
                  完璧に当てはまらなくて大丈夫です。一番近いものを選んでください。
                </p>
                <div className="mt-5">
                  <SituationSelector value={situation} onChange={setSituation} />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-[var(--text-main)]">やりとりを送る</h2>
                <div className="mt-5">
                  <UnifiedInput
                    mode={inputMode}
                    textValue={inputText}
                    imageFiles={imageFiles}
                    messageCount={messageCount}
                    maxTextLength={MAX_INPUT_LENGTH}
                    onAddImages={handleAddImages}
                    onRemoveImage={handleRemoveImage}
                    onTextChange={handleTextChange}
                    onTextPaste={handleTextPaste}
                    onSwitchToText={switchToText}
                    onSwitchToImages={switchToImages}
                  />
                </div>
              </section>
            </div>

            {error ? (
              <div className="mt-5 rounded-[1.3rem] border border-[rgba(232,69,60,0.16)] bg-[rgba(232,69,60,0.08)] px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting || isPreparingImages}
              className="cta-button mt-6 inline-flex w-full items-center justify-center rounded-[1.3rem] px-5 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPreparingImages
                ? "スクショを準備しています..."
                : isSubmitting
                  ? "重量を測定しています..."
                  : "重量を測定する"}
            </button>

            <p className="mt-4 text-xs leading-6 text-[var(--text-sub)]">
              ※ スクショに映る名前やアイコンは分析に使いません。画像もテキストもサーバー保存せず、構造分析後に破棄します。
            </p>
          </div>
        </div>

        {isSubmitting ? <WeightAnalyzingScreen phaseText={activePhases[phaseIndex]} inputMode={inputMode === "images" ? "images" : "text"} /> : null}

        {pendingLowConfidence ? (
          <div className="mt-6">
            <ConfidenceWarning
              messageCount={pendingLowConfidence.analysis.messages.length}
              onContinue={() => finalizeAnalysis(pendingLowConfidence.analysis, pendingLowConfidence.situation)}
              onAddScreenshots={() => {
                setPendingLowConfidence(null);
                switchToImages();
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onSwitchToText={() => {
                setPendingLowConfidence(null);
                switchToText();
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>
        ) : null}

        {loadedResult && sharePayload ? (
          <div ref={resultRef} className="mt-2">
            <WeightResultScreen
              situation={loadedResult.situation}
              result={loadedResult.result}
              messageCount={loadedResult.sourceMeta.myMessageCount + loadedResult.sourceMeta.theirMessageCount}
              sourceMeta={loadedResult.sourceMeta}
              analysisComment={loadedResult.analysis.comment}
              analysisExplanation={loadedResult.analysis.explanation}
              analysisImprovement={loadedResult.analysis.improvement}
              analysisExample={loadedResult.analysis.example}
              comment={loadedResult.comment}
              xShareUrl={getWeightXShareUrl(sharePayload)}
              lineShareUrl={getWeightLineShareUrl(sharePayload)}
              onRestart={handleRestart}
            />
          </div>
        ) : null}

        <section className="mt-6">
          <h2 className="text-xl font-black text-[var(--text-main)]">他の診断もやる</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CrossPromotion
              href="/prof"
              eyebrow="PROFILE CHECK"
              title="プロフィール偏差値"
              description="会話の前に見直したいなら、実際のプロフィール文を貼って偏差値を見るほうが早いです。"
            />
            <CrossPromotion
              href="/conditions"
              eyebrow="CONDITION CHECK"
              title="条件チェッカー"
              description="理想条件に合う相手がどのくらいいるかを人数で見たいときは、こちらで需給を確認できます。"
            />
          </div>
        </section>
      </div>
    </section>
  );
}
