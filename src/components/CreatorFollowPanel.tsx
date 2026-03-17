"use client";

import { trackEvent } from "@/lib/analytics";
import { getCreatorLinks } from "@/lib/creator-links";

type CreatorFollowPanelProps = {
  context: string;
  quizName:
    | "app_hensachi"
    | "konkatsu_yoji"
    | "prof_hensachi"
    | "conditions_check"
    | "market_equivalent"
    | "message_weight"
    | "my9specs";
  title?: string;
  description?: string;
  compact?: boolean;
  actionPosition?: "top" | "bottom";
  xLabel?: string;
  noteLabel?: string;
};

const { noteUrl, xUrl } = getCreatorLinks();

export function CreatorFollowPanel({
  context,
  quizName,
  title = "改善ヒントを追うならここ",
  description = "恋愛・婚活についてヒントや考察を拾いたいときはX、プロフィール・写真・会話をもう少し整理して読みたいときはnoteが向いています。",
  compact = false,
  actionPosition = "bottom",
  xLabel = "Xで @yauyuism をフォロー",
  noteLabel = "noteで @yauyuism をフォロー",
}: CreatorFollowPanelProps) {
  const handleClick = (platform: "x" | "note") => {
    trackEvent(platform === "x" ? "x_follow_click" : "note_click", {
      quiz_name: quizName,
      placement: context,
    });
  };

  const actionBlock = (
    <div className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-2" : ""}`}>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleClick("x")}
        className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
      >
        {xLabel}
      </a>
      <a
        href={noteUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleClick("note")}
        className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
      >
        {noteLabel}
      </a>
    </div>
  );

  return (
    <section className="soft-panel h-full rounded-[1.8rem] p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)] sm:text-base">{description}</p>
      {actionPosition === "top" ? actionBlock : null}
      <div className="mt-4 border-t border-[color:var(--line)] pt-4 text-sm leading-7 text-[var(--text-sub)]">
        <p>
          <span className="font-bold text-[var(--text-main)]">X:</span> 日々の短い考察や更新情報を出しています。
        </p>
        <p className="mt-2">
          <span className="font-bold text-[var(--text-main)]">note:</span> 条件設定や婚活の考え方を長めに整理しています。
        </p>
      </div>
      {actionPosition === "bottom" ? actionBlock : null}
    </section>
  );
}
