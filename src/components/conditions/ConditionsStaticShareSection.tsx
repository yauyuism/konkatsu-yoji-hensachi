"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ShareImage } from "@/components/conditions/ShareImage";
import { trackEvent } from "@/lib/analytics";
import type { CalculationSummary, Conditions } from "@/lib/conditions";
import type { InputMethod } from "@/lib/convert-filter";
import { downloadResultImage } from "@/lib/result-image";

type ConditionsStaticShareSectionProps = {
  conditions: Conditions;
  summary: CalculationSummary;
  inputMethod: InputMethod;
  xShareUrl: string;
  lineShareUrl: string;
};

export function ConditionsStaticShareSection({
  conditions,
  summary,
  inputMethod,
  xShareUrl,
  lineShareUrl,
}: ConditionsStaticShareSectionProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleShareClick = (platform: "x" | "line") => {
    trackEvent("conditions_share_click", {
      quiz_name: "conditions_check",
      platform,
      count: summary.count,
      input_method: inputMethod,
      placement: "share_result_page",
    });
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
      placement: "share_result_page",
    });

    try {
      await downloadResultImage(captureRef.current, `conditions-check-${summary.count}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section data-testid="conditions-static-share-section" className="soft-panel rounded-[1rem] p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">条件だけを URL 化しているので、個人情報や入力履歴は含みません。</p>
      {inputMethod === "screenshot" ? (
        <p className="mt-3 rounded-[1rem] bg-[rgba(59,130,246,0.08)] px-4 py-3 text-sm font-bold text-[#1D4ED8]">
          この結果はスクショ読み取りから始めた条件としてシェアされます。
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("x")}
          className="btn-primary"
        >
          Xでシェアする
        </a>
        <Link
          href="/conditions"
          className="btn-secondary"
        >
          条件を変えてやり直す
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <a href={lineShareUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleShareClick("line")} className="share-icon-link">
          <span aria-hidden="true">📩</span>
          LINEで送る
        </a>
        <button type="button" onClick={handleSaveImage} disabled={isSaving} data-testid="conditions-save-card" className="share-icon-link disabled:cursor-not-allowed disabled:opacity-60">
          <span aria-hidden="true">📷</span>
          {isSaving ? "画像を保存しています..." : "画像を保存"}
        </button>
      </div>

      <div className="pointer-events-none fixed left-[-200vw] top-0">
        <ShareImage ref={captureRef} conditions={conditions} summary={summary} />
      </div>
    </section>
  );
}
