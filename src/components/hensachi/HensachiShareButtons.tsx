"use client";

import Link from "next/link";
import { type RefObject, useState } from "react";

import type { HensachiDiagnosisResult } from "@/lib/hensachi";
import { downloadResultImage } from "@/lib/result-image";
import { getHensachiLineShareUrl, getHensachiXShareUrl } from "@/lib/hensachi-share";
import { trackEvent } from "@/lib/analytics";

type HensachiShareButtonsProps = {
  result: HensachiDiagnosisResult;
  resultUrl: string;
  captureRef: RefObject<HTMLDivElement>;
  onRestart?: () => void;
  restartHref?: string;
};

export function HensachiShareButtons({
  result,
  resultUrl,
  captureRef,
  onRestart,
  restartHref = "/",
}: HensachiShareButtonsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const openShareWindow = (url: string, platform: "x" | "line") => {
    trackEvent("share_click", {
      quiz_name: "app_hensachi",
      platform,
      result_title: result.title,
      total_hensachi: result.totalHensachi,
    });

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(resultUrl).catch(() => undefined);
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      trackEvent("save_image_click", {
        quiz_name: "app_hensachi",
        result_title: result.title,
        total_hensachi: result.totalHensachi,
      });

      await downloadResultImage(captureRef.current, `app-hensachi-${result.totalHensachi}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => openShareWindow(getHensachiXShareUrl(result, resultUrl), "x")}
        className="btn-primary rounded-[8px]"
      >
        Xでシェア
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(getHensachiLineShareUrl(result, resultUrl), "line")}
        className="btn-secondary rounded-[8px]"
      >
        LINEで送る
      </button>

      <button
        type="button"
        onClick={handleSaveImage}
        disabled={isSaving}
        className="btn-secondary rounded-[8px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSaving ? "画像を保存しています..." : "画像を保存"}
      </button>

      {onRestart ? (
        <button
          type="button"
          onClick={onRestart}
          className="btn-secondary rounded-[8px]"
        >
          もう一度測定する
        </button>
      ) : (
        <Link
          href={restartHref}
          className="btn-secondary rounded-[8px]"
        >
          もう一度測定する
        </Link>
      )}
    </div>
  );
}
