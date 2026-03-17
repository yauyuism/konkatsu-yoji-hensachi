"use client";

import { useState } from "react";

import type { HighlightedSegment } from "@/lib/prof";

type HighlightedProfileProps = {
  segments: HighlightedSegment[];
};

export function HighlightedProfile({ segments }: HighlightedProfileProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className="rounded-[1.6rem] border border-[color:rgba(26,26,26,0.08)] bg-white/86 p-5 text-sm leading-8 text-[var(--text-main)] sm:text-base">
      <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold tracking-[0.08em]">
        <span className="rounded-full bg-[rgba(232,69,60,0.1)] px-3 py-1 text-[var(--accent)]">赤 = 改善ポイント</span>
        <span className="rounded-full bg-[rgba(59,130,246,0.1)] px-3 py-1 text-[#3B82F6]">青 = 良いポイント</span>
        <span className="rounded-full bg-[rgba(26,26,26,0.06)] px-3 py-1 text-[var(--text-sub)]">
          色付きの箇所をタップすると理由が開く
        </span>
      </div>

      <div>
        {segments.map((segment) => {
          if (segment.type === "neutral") {
            return <span key={segment.key}>{segment.text}</span>;
          }

          const active = activeKey === segment.key;
          const styles = segment.type === "good"
            ? "border-[#3B82F6] bg-[rgba(59,130,246,0.08)] text-[var(--text-main)]"
            : "border-[var(--accent)] bg-[rgba(232,69,60,0.08)] text-[var(--text-main)]";

          return (
            <span key={segment.key} className="relative">
              <button
                type="button"
                onClick={() => setActiveKey(active ? null : segment.key)}
                aria-expanded={active}
                className={`inline rounded-sm border-b-2 px-0.5 text-left ${styles}`}
              >
                {segment.text}
              </button>
              {active ? (
                <span className="absolute left-0 top-full z-10 mt-2 block w-[min(260px,calc(100vw-4rem))] rounded-[1rem] border border-[color:var(--line)] bg-white p-3 text-sm leading-6">
                  <span className={`block text-xs font-bold tracking-[0.14em] ${segment.type === "good" ? "text-[#3B82F6]" : "text-[var(--accent)]"}`}>
                    {segment.type === "good" ? "GOOD" : "改善ポイント"}
                  </span>
                  <span className="mt-2 block text-[var(--text-main)]">{segment.reason}</span>
                  {segment.suggestion ? <span className="mt-2 block text-[#10B981]">💡 {segment.suggestion}</span> : null}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
