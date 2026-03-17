"use client";

import Link from "next/link";
import { type RefObject, useState } from "react";

import type { Result } from "@/data/results";
import { trackEvent } from "@/lib/analytics";
import { downloadResultImage } from "@/lib/result-image";
import { getLineShareUrl, getXShareUrl } from "@/lib/share";

type ShareButtonsProps = {
  result: Result;
  resultUrl: string;
  captureRef: RefObject<HTMLDivElement>;
  onRestart?: () => void;
  restartHref?: string;
};

export function ShareButtons({
  result,
  resultUrl,
  captureRef,
  onRestart,
  restartHref = "/",
}: ShareButtonsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const openShareWindow = (url: string, platform: "x" | "line") => {
    trackEvent("share_click", {
      quiz_name: "konkatsu_yoji",
      platform,
      result_type: result.type,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      trackEvent("save_image_click", {
        quiz_name: "konkatsu_yoji",
        result_type: result.type,
      });

      await downloadResultImage(captureRef.current, `konkatsu-yoji-${result.type}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => openShareWindow(getXShareUrl(result, resultUrl), "x")}
        className="cta-button rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
      >
        Xでシェアする
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(getLineShareUrl(result, resultUrl), "line")}
        className="secondary-button rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
      >
        LINEで送る
      </button>

      <button
        type="button"
        onClick={handleSaveImage}
        disabled={isSaving}
        className="soft-button rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)] disabled:cursor-wait disabled:opacity-70"
      >
        {isSaving ? "画像を保存しています..." : "画像を保存する"}
      </button>

      {onRestart ? (
        <button
          type="button"
          onClick={onRestart}
          className="ghost-button rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
        >
          もう一度診断する
        </button>
      ) : (
        <Link
          href={restartHref}
          className="ghost-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
        >
          もう一度診断する
        </Link>
      )}
    </div>
  );
}
