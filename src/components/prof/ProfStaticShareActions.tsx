"use client";

import { useRef, useState } from "react";

import { ShareImage } from "@/components/prof/ShareImage";
import { trackEvent } from "@/lib/analytics";
import { downloadResultImage } from "@/lib/result-image";

type ProfStaticShareActionsProps = {
  xShareUrl: string;
  lineShareUrl: string;
  total: number;
  appLabel?: string;
};

export function ProfStaticShareActions({
  xShareUrl,
  lineShareUrl,
  total,
  appLabel = "プロフィール",
}: ProfStaticShareActionsProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleShareClick = (platform: "x" | "line") => {
    trackEvent("share_click", {
      quiz_name: "prof_hensachi",
      platform,
      mode: "share_result_page",
      total_hensachi: total,
    });
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    trackEvent("save_image_click", {
      quiz_name: "prof_hensachi",
      mode: "share_result_page",
      total_hensachi: total,
    });

    try {
      await downloadResultImage(captureRef.current, `profile-hensachi-${total}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mt-5 grid gap-3">
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("x")}
          className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
        >
          Xでシェア
        </a>
        <a
          href={lineShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("line")}
          className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
        >
          LINEで送る
        </a>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={isSaving}
          data-testid="prof-save-card"
          className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)] disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? "画像を保存しています..." : "画像を保存"}
        </button>
      </div>

      <div className="pointer-events-none fixed left-[-200vw] top-0">
        <ShareImage ref={captureRef} appLabel={appLabel} total={total} />
      </div>
    </>
  );
}
