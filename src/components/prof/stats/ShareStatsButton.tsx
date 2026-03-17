"use client";

import { trackEvent } from "@/lib/analytics";

type ShareStatsButtonProps = {
  href: string;
};

export function ShareStatsButton({ href }: ShareStatsButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="stats-share-x"
      onClick={() => {
        trackEvent("share_click", {
          quiz_name: "prof_stats",
          platform: "x",
          mode: "stats",
        });
      }}
      className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
    >
      Xでシェア
    </a>
  );
}
