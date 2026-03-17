"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { ToolCard } from "@/components/ToolCard";
import { AgeRangeSlider } from "@/components/conditions/AgeRangeSlider";
import { AppSelector } from "@/components/conditions/AppSelector";
import { ConditionResultStorageSync } from "@/components/conditions/ConditionResultStorageSync";
import { ConditionsResultCard } from "@/components/conditions/ConditionsResultCard";
import { HeightRangeSlider } from "@/components/conditions/HeightRangeSlider";
import { IncomeRangeSlider } from "@/components/conditions/IncomeRangeSlider";
import { ResultCounter } from "@/components/conditions/ResultCounter";
import { ScreenshotConfirm } from "@/components/conditions/ScreenshotConfirm";
import { ScreenshotUploader } from "@/components/conditions/ScreenshotUploader";
import { ShareImage } from "@/components/conditions/ShareImage";
import { EDUCATIONS, GENDER_LABELS, VISIBLE_REGIONS, incomeThresholds } from "@/data/conditions";
import { trackEvent } from "@/lib/analytics";
import { useMarkCompletedTool } from "@/lib/completed-tools";
import {
  DEFAULT_CONDITIONS,
  getCalculationSummary,
  getHeightLabel,
  getHeightOptions,
  getIncomeLabel,
  serializeConditionsParams,
  type Conditions,
} from "@/lib/conditions";
import {
  convertFilterResultToConditions,
  hasRecognizedConditions,
  type InputMethod,
  type ReadFilterResult,
  type SupportedApp,
} from "@/lib/convert-filter";
import { getConditionsLineShareUrl, getConditionsXShareUrl } from "@/lib/conditions-share";
import { downloadResultImage } from "@/lib/result-image";

type ReadStatus = "idle" | "loading" | "done" | "error";

function normalizeHeightBounds(
  gender: Conditions["targetGender"],
  heightMin: number,
  heightMax: number
): Pick<Conditions, "heightMin" | "heightMax"> {
  const options = getHeightOptions(gender);
  const normalizedMin = options.some((option) => option === heightMin) ? heightMin : 0;
  const normalizedMax = options.some((option) => option === heightMax) ? heightMax : 0;

  if (normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax) {
    return {
      heightMin: normalizedMax,
      heightMax: normalizedMin,
    };
  }

  return {
    heightMin: normalizedMin,
    heightMax: normalizedMax,
  };
}

function normalizeIncomeBounds(incomeMin: number, incomeMax: number): Pick<Conditions, "incomeMin" | "incomeMax"> {
  const normalizedMin = incomeThresholds.some((option) => option === incomeMin) ? incomeMin : 0;
  const normalizedMax = incomeThresholds.some((option) => option === incomeMax) ? incomeMax : 0;

  if (normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax) {
    return {
      incomeMin: normalizedMax,
      incomeMax: normalizedMin,
    };
  }

  return {
    incomeMin: normalizedMin,
    incomeMax: normalizedMax,
  };
}

function getPercentageLabel(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

async function resizeImageToJpegBase64(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像を開けませんでした"));
    img.src = dataUrl;
  });

  const maxWidth = 1280;
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("画像変換の準備に失敗しました");
  }

  context.drawImage(image, 0, 0, width, height);
  const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
  const [, base64 = ""] = resizedDataUrl.split(",");

  if (!base64) {
    throw new Error("画像の変換に失敗しました");
  }

  return base64;
}

async function saveConditionsSnapshot(payload: {
  conditions: Conditions;
  inputMethod: InputMethod;
  screenshotApp: SupportedApp | null;
  screenshotConfidence: ReadFilterResult["confidence"] | null;
}) {
  const response = await fetch("/api/conditions-stats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`匿名統計の保存に失敗しました (${response.status})`);
  }
}

function SelectionGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
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
  );
}

function FieldShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="paper-card rounded-[1rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{description}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ConditionEditor({
  conditions,
  summary,
  heightOptions,
  onUpdate,
  onShowResult,
  onReset,
  showActions = true,
}: {
  conditions: Conditions;
  summary: ReturnType<typeof getCalculationSummary>;
  heightOptions: readonly number[];
  onUpdate: (patch: Partial<Conditions>) => void;
  onShowResult?: () => void;
  onReset?: () => void;
  showActions?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <FieldShell title="相手の性別">
        <SelectionGroup
          value={conditions.targetGender}
          onChange={(targetGender) => onUpdate({ targetGender })}
          options={Object.entries(GENDER_LABELS).map(([value, label]) => ({
            value: value as Conditions["targetGender"],
            label,
          }))}
        />
      </FieldShell>

      <FieldShell title="年齢" description="18〜60歳の範囲で指定。5歳刻みの年齢帯で区切って計算します。">
        <AgeRangeSlider
          min={conditions.ageMin}
          max={conditions.ageMax}
          onChange={({ min, max }) => onUpdate({ ageMin: min, ageMax: max })}
        />
      </FieldShell>

      <FieldShell title="年収" description="下限も上限も指定できます。片側だけでも使えます。">
        <IncomeRangeSlider
          options={incomeThresholds}
          min={conditions.incomeMin}
          max={conditions.incomeMax}
          onChange={({ min, max }) => onUpdate({ incomeMin: min, incomeMax: max })}
          valueLabel={getIncomeLabel(conditions.incomeMin, conditions.incomeMax)}
          helper={`この年齢帯のうち ${getPercentageLabel(summary.incomeRatio)}`}
        />
      </FieldShell>

      <FieldShell title="身長" description="下限も上限も指定できます。どちらか片方だけでも使えます。">
        <HeightRangeSlider
          options={heightOptions}
          min={conditions.heightMin}
          max={conditions.heightMax}
          onChange={({ min, max }) => onUpdate({ heightMin: min, heightMax: max })}
          valueLabel={getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax)}
          helper={`この性別のうち ${getPercentageLabel(summary.heightRatio)}`}
        />
      </FieldShell>

      <FieldShell title="学歴" description={`選択中の条件では ${getPercentageLabel(summary.educationRatio)} が対象です。`}>
        <SelectionGroup
          value={conditions.education}
          onChange={(education) => onUpdate({ education })}
          options={Object.entries(EDUCATIONS).map(([value, label]) => ({
            value: value as Conditions["education"],
            label,
          }))}
        />
      </FieldShell>

      <FieldShell title="居住エリア">
        <SelectionGroup
          value={conditions.region}
          onChange={(region) => onUpdate({ region })}
          options={Object.entries(VISIBLE_REGIONS).map(([value, info]) => ({
            value: value as Conditions["region"],
            label: info.label,
          }))}
        />
      </FieldShell>

      {showActions && onShowResult && onReset ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onShowResult}
            data-testid="conditions-show-result"
            className="btn-primary"
          >
            結果を詳しく見る
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-link inline-flex items-center"
          >
            デフォルトに戻す
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ConditionsApp() {
  const formRef = useRef<HTMLDivElement>(null);
  const manualRef = useRef<HTMLDivElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const trackedResultRef = useRef(false);
  const savedSnapshotKeysRef = useRef(new Set<string>());
  const pendingSnapshotKeysRef = useRef(new Set<string>());
  const [conditions, setConditions] = useState<Conditions>(DEFAULT_CONDITIONS);
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [showResult, setShowResult] = useState(false);
  const [showScreenshotFlow, setShowScreenshotFlow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedApp, setSelectedApp] = useState<SupportedApp | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [readStatus, setReadStatus] = useState<ReadStatus>("idle");
  const [readProgress, setReadProgress] = useState(0);
  const [readError, setReadError] = useState<string | null>(null);
  const [readResult, setReadResult] = useState<ReadFilterResult | null>(null);
  const [appliedScreenshot, setAppliedScreenshot] = useState(false);
  const [appliedScreenshotApp, setAppliedScreenshotApp] = useState<SupportedApp | null>(null);
  const [appliedScreenshotConfidence, setAppliedScreenshotConfidence] = useState<ReadFilterResult["confidence"] | null>(null);
  const deferredConditions = useDeferredValue(conditions);
  const summary = getCalculationSummary(deferredConditions);
  const heightOptions = getHeightOptions(conditions.targetGender);

  useMarkCompletedTool("conditions", showResult);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (readStatus !== "loading") {
      return;
    }

    setReadProgress(12);

    const intervalId = window.setInterval(() => {
      setReadProgress((current) => {
        if (current >= 92) {
          return current;
        }
        if (current < 55) {
          return current + 11;
        }
        if (current < 78) {
          return current + 6;
        }
        return current + 3;
      });
    }, 240);

    return () => window.clearInterval(intervalId);
  }, [readStatus]);

  useEffect(() => {
    if (!showResult || trackedResultRef.current) {
      return;
    }

    trackedResultRef.current = true;
    trackEvent("conditions_result_view", {
      quiz_name: "conditions_check",
      count: summary.count,
      gender: deferredConditions.targetGender,
      region: deferredConditions.region,
      input_method: inputMethod,
    });
  }, [deferredConditions.region, deferredConditions.targetGender, inputMethod, showResult, summary.count]);

  const updateConditions = (patch: Partial<Conditions>) => {
    setConditions((current) => {
      const nextGender = patch.targetGender ?? current.targetGender;
      const next = {
        ...current,
        ...patch,
      };
      const normalizedIncome = normalizeIncomeBounds(next.incomeMin, next.incomeMax);
      const normalizedHeight = normalizeHeightBounds(nextGender, next.heightMin, next.heightMax);

      return {
        ...next,
        ...normalizedIncome,
        ...normalizedHeight,
      };
    });
  };

  const queueConditionsSnapshotSave = (snapshotConditions: Conditions) => {
    const snapshotKey = [
      serializeConditionsParams(snapshotConditions),
      inputMethod,
      inputMethod === "screenshot" ? appliedScreenshotApp ?? "none" : "manual",
      inputMethod === "screenshot" ? appliedScreenshotConfidence ?? "none" : "na",
    ].join("|");

    if (savedSnapshotKeysRef.current.has(snapshotKey) || pendingSnapshotKeysRef.current.has(snapshotKey)) {
      return;
    }

    pendingSnapshotKeysRef.current.add(snapshotKey);

    void saveConditionsSnapshot({
      conditions: snapshotConditions,
      inputMethod,
      screenshotApp: inputMethod === "screenshot" ? appliedScreenshotApp : null,
      screenshotConfidence: inputMethod === "screenshot" ? appliedScreenshotConfidence : null,
    })
      .then(() => {
        savedSnapshotKeysRef.current.add(snapshotKey);
      })
      .catch((error) => {
        console.warn("Failed to persist anonymous conditions stats", error);
      })
      .finally(() => {
        pendingSnapshotKeysRef.current.delete(snapshotKey);
      });
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setReadError("画像ファイルを選んでください");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setReadError("画像サイズを小さくしてください（5MB以下）");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setReadError(null);
    setReadStatus("idle");
    setReadProgress(0);
    setReadResult(null);
  };

  const handleReadScreenshot = async () => {
    if (!selectedApp) {
      setReadError("先にアプリを選択してください");
      return;
    }

    if (!selectedFile) {
      setReadError("スクリーンショットを選んでください");
      return;
    }

    setReadError(null);
    setReadResult(null);
    setReadStatus("loading");
    setReadProgress(10);
    trackEvent("conditions_screenshot_read_start", {
      quiz_name: "conditions_check",
      app_name: selectedApp,
    });

    try {
      const image = await resizeImageToJpegBase64(selectedFile);
      const response = await fetch("/api/read-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          appName: selectedApp,
        }),
      });
      const json = (await response.json()) as ReadFilterResult & { error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? "読み取りに失敗しました");
      }

      if (!hasRecognizedConditions(json)) {
        throw new Error("条件を読み取れませんでした。別のスクショか手動入力を試してください。");
      }

      setReadResult(json);
      setReadStatus("done");
      setReadProgress(100);
      trackEvent("conditions_screenshot_read_success", {
        quiz_name: "conditions_check",
        app_name: selectedApp,
        confidence: json.confidence,
      });
    } catch (error) {
      console.error(error);
      setReadStatus("error");
      setReadProgress(0);
      setReadResult(null);
      setReadError(error instanceof Error ? error.message : "読み取りに失敗しました。手動で入力してください。");
      trackEvent("conditions_screenshot_read_error", {
        quiz_name: "conditions_check",
        app_name: selectedApp,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  };

  const handleApplyReadResult = () => {
    if (!readResult) {
      return;
    }

    const patch = convertFilterResultToConditions(readResult);
    const targetGender = patch.targetGender ?? DEFAULT_CONDITIONS.targetGender;
    const normalizedIncome = normalizeIncomeBounds(
      patch.incomeMin ?? (patch.incomeMax !== undefined ? 0 : DEFAULT_CONDITIONS.incomeMin),
      patch.incomeMax ?? (patch.incomeMin !== undefined ? 0 : DEFAULT_CONDITIONS.incomeMax)
    );
    const normalizedHeight = normalizeHeightBounds(
      targetGender,
      patch.heightMin ?? (patch.heightMax !== undefined ? 0 : DEFAULT_CONDITIONS.heightMin),
      patch.heightMax ?? (patch.heightMin !== undefined ? 0 : DEFAULT_CONDITIONS.heightMax)
    );
    const next: Conditions = {
      ...DEFAULT_CONDITIONS,
      ...patch,
      ...normalizedIncome,
      ...normalizedHeight,
    };

    setConditions(next);
    setInputMethod("screenshot");
    setAppliedScreenshot(true);
    setAppliedScreenshotApp(selectedApp);
    setAppliedScreenshotConfidence(readResult.confidence);
    setShowScreenshotFlow(false);
    setShowResult(false);
    trackedResultRef.current = false;
    window.requestAnimationFrame(() => {
      manualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleShare = (platform: "x" | "line") => {
    const shareUrl =
      platform === "x"
        ? getConditionsXShareUrl(deferredConditions, summary.count, summary.percentage, inputMethod)
        : getConditionsLineShareUrl(deferredConditions, summary.count, summary.percentage, inputMethod);

    trackEvent("conditions_share_click", {
      quiz_name: "conditions_check",
      platform,
      count: summary.count,
      input_method: inputMethod,
    });
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    trackEvent("conditions_save_image_click", {
      quiz_name: "conditions_check",
      count: summary.count,
      input_method: inputMethod,
    });

    try {
      await downloadResultImage(captureRef.current, `conditions-check-${summary.count}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowResult = () => {
    setShowResult(true);
    trackedResultRef.current = false;
    queueConditionsSnapshotSave(conditions);
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setConditions(DEFAULT_CONDITIONS);
    setInputMethod("manual");
    setShowResult(false);
    setShowScreenshotFlow(false);
    setSelectedApp(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setReadStatus("idle");
    setReadProgress(0);
    setReadError(null);
    setReadResult(null);
    setAppliedScreenshot(false);
    setAppliedScreenshotApp(null);
    setAppliedScreenshotConfidence(null);
    trackedResultRef.current = false;
    manualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRetryScreenshot = () => {
    setReadResult(null);
    setReadError(null);
    setReadStatus("idle");
    setReadProgress(0);
  };

  const openScreenshotFlow = () => {
    setShowScreenshotFlow(true);
    window.requestAnimationFrame(() => {
      screenshotRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeScreenshotFlow = () => {
    setShowScreenshotFlow(false);
    setReadError(null);
    setReadStatus("idle");
    setReadProgress(0);
    setReadResult(null);
  };

  return (
    <section data-testid="conditions-page" className="screen-shell relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <div className="absolute left-[-4rem] top-10 h-48 w-48 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-28 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.1)] blur-3xl" />

      <div className="relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow mx-auto inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
            CONDITION CHECK
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
            あなたが考える&quot;普通&quot;の
            <span className="block">男女は、</span>
            <span className="block text-[var(--accent)]">日本に何人いる？</span>
          </h1>

          <p className="mt-5 text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            条件を動かすたびに、人数がリアルタイムで変わります。
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm text-[var(--text-sub)]">
            <span className="tag">無料</span>
            <span className="tag">登録不要</span>
            <span className="tag">保存なし</span>
          </div>

          <button
            type="button"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="btn-primary mt-8 sm:text-base"
          >
            条件を動かしてみる ↓
          </button>
        </div>

        <div ref={formRef} className="mx-auto mt-10 max-w-5xl">
          {!showResult ? (
            <div ref={manualRef} className="grid gap-5">
              {appliedScreenshot ? (
                <div className="rounded-[0.9rem] border border-[rgba(59,130,246,0.14)] bg-[rgba(59,130,246,0.08)] px-4 py-4 text-sm leading-7 text-[#1D4ED8]">
                  スクショから初期値を反映しました。ここからスライダーで細かく調整できます。
                </div>
              ) : null}

              <ResultCounter count={summary.count} percentage={summary.percentage} />

              <ConditionEditor
                conditions={conditions}
                summary={summary}
                heightOptions={heightOptions}
                onUpdate={updateConditions}
                onShowResult={handleShowResult}
                onReset={handleReset}
              />

              <section ref={screenshotRef} className="rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
                <button
                  type="button"
                  onClick={showScreenshotFlow ? closeScreenshotFlow : openScreenshotFlow}
                  data-testid="open-screenshot-flow"
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div>
                    <p className="text-sm font-black text-[var(--text-main)]">📱 アプリのスクショからも入力できます</p>
                    <p className="mt-1 text-sm leading-7 text-[var(--text-sub)]">
                      検索条件の設定画面を読み取って、スライダーの初期値に反映します。
                    </p>
                  </div>
                  <span className="text-link">{showScreenshotFlow ? "閉じる" : "開く →"}</span>
                </button>

                {showScreenshotFlow ? (
                  <div className="mt-5 grid gap-4">
                    <AppSelector value={selectedApp} onChange={setSelectedApp} />
                    <ScreenshotUploader
                      previewUrl={previewUrl}
                      fileName={selectedFile?.name ?? null}
                      error={readError}
                      onSelectFile={handleFileSelect}
                      onRead={handleReadScreenshot}
                      disabled={!selectedApp || !selectedFile}
                      isReading={readStatus === "loading"}
                    />

                    {readStatus === "loading" ? (
                      <section className="paper-card rounded-[1rem] p-5 sm:p-6">
                        <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 3</p>
                        <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">読み取り中...</h2>
                        <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">アプリの検索条件を読み取っています。</p>
                        <div className="mt-5 overflow-hidden rounded-full bg-[rgba(26,26,26,0.08)]">
                          <div
                            className="h-3 rounded-full bg-[linear-gradient(90deg,#3B82F6,#60A5FA)] transition-[width] duration-300"
                            style={{ width: `${readProgress}%` }}
                          />
                        </div>
                        <p className="font-numeric mt-3 text-right text-sm font-black text-[var(--text-main)]">{readProgress}%</p>
                      </section>
                    ) : null}

                    {readResult ? (
                      <ScreenshotConfirm
                        result={readResult}
                        onApply={handleApplyReadResult}
                        onRetry={handleRetryScreenshot}
                        onManualFallback={closeScreenshotFlow}
                      />
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">他の診断もやる</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <ToolCard
                    label="MARKET VALUE"
                    title="婚活スペック年収換算"
                    description="相手への条件だけでなく、自分が市場でどう見えるかも確認します。"
                    tags={["フォーム入力", "約30秒"]}
                    href="/market"
                  />
                  <ToolCard
                    label="PROFILE CHECK"
                    title="プロフィール偏差値診断"
                    description="この人数の中で選ばれるプロフィールになっているかを点検します。"
                    tags={["本文貼り付け", "約2分"]}
                    href="/prof"
                  />
                </div>
              </section>
            </div>
          ) : (
            <div ref={resultRef} data-testid="conditions-result" className="grid gap-6">
              <ConditionResultStorageSync conditions={deferredConditions} summary={summary} />

              <ConditionsResultCard
                conditions={deferredConditions}
                summary={summary}
                shareSection={
                  <section className="soft-panel rounded-[1rem] p-5 sm:p-6">
                    <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleShare("x")}
                        className="btn-primary"
                      >
                        Xでシェアする
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResult(false);
                          window.requestAnimationFrame(() => {
                            manualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          });
                        }}
                        className="btn-secondary"
                      >
                        条件を変えてやり直す
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4">
                      <button type="button" onClick={() => handleShare("line")} className="share-icon-link">
                        <span aria-hidden="true">📩</span>
                        LINEで送る
                      </button>
                      <button type="button" onClick={handleSaveImage} disabled={isSaving} className="share-icon-link disabled:cursor-not-allowed disabled:opacity-60">
                        <span aria-hidden="true">📷</span>
                        {isSaving ? "画像を保存しています..." : "画像を保存"}
                      </button>
                    </div>
                    {inputMethod === "screenshot" ? (
                      <p className="mt-4 rounded-[1rem] bg-[rgba(59,130,246,0.08)] px-4 py-3 text-sm font-bold text-[#1D4ED8]">
                        この結果はスクショから読み取った条件をもとにしています。
                      </p>
                    ) : null}
                  </section>
                }
                adjustmentPanel={
                  <details className="rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
                    <summary className="cursor-pointer list-none text-sm font-black text-[var(--text-main)]">
                      条件を調整する
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
                      条件を動かすと、この結果もすぐ更新されます。
                    </p>
                    <div className="mt-5">
                      <ConditionEditor
                        conditions={conditions}
                        summary={summary}
                        heightOptions={heightOptions}
                        onUpdate={updateConditions}
                        showActions={false}
                      />
                    </div>
                  </details>
                }
                logicPanel={
                  <details className="rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
                    <summary className="cursor-pointer list-none text-sm font-black text-[var(--text-main)]">
                      計算ロジック
                    </summary>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-sub)]">
                      <p>未婚者数に、年齢の重なり・年収分布・身長分布・学歴比率を掛け合わせて推計しています。</p>
                      <p>年齢は5歳刻み統計に按分し、年収・学歴は年齢帯ごとの分布、身長は性別ごとの分布で近似しています。</p>
                      <p>各条件を独立と仮定した概算なので、実数とはズレる場合があります。</p>
                    </div>
                  </details>
                }
                supportSection={
                  <CreatorFollowPanel
                    context="conditions_result"
                    quizName="conditions_check"
                    title="@yauyuism"
                    description="条件設定の考え方は X、長めの整理は note に置いています。"
                    actionPosition="top"
                  />
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none fixed left-[-200vw] top-0">
        <ShareImage ref={captureRef} conditions={deferredConditions} summary={summary} />
      </div>
    </section>
  );
}
