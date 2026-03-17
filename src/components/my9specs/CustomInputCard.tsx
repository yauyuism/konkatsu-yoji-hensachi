"use client";

import { useState } from "react";

import { CUSTOM_SPEC_MAX_LENGTH } from "@/lib/my9specs";

type CustomInputCardProps = {
  category: string;
  disabled?: boolean;
  onAdd: (text: string) => void;
};

export function CustomInputCard({ category, disabled = false, onAdd }: CustomInputCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");

  function reset() {
    setIsEditing(false);
    setText("");
  }

  function handleAdd() {
    const value = text.trim();
    if (!value) {
      return;
    }

    onAdd(value);
    reset();
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={disabled}
        className={`group flex min-h-[88px] flex-col items-center justify-center rounded-[1rem] border border-dashed px-2 py-3 text-center transition ${
          disabled
            ? "cursor-not-allowed border-[rgba(26,26,26,0.08)] bg-[rgba(26,26,26,0.03)] opacity-45"
            : "border-[rgba(26,26,26,0.15)] bg-white hover:border-[rgba(26,26,26,0.3)]"
        }`}
      >
        <span className="text-[1.2rem] leading-none">✍️</span>
        <span className="mt-2 text-[0.78rem] font-bold leading-5 text-[var(--text-sub)]">自分で書く</span>
      </button>
    );
  }

  return (
    <div className="col-span-full rounded-[1rem] border-2 border-[var(--accent)] bg-[var(--accent-soft)] p-4">
      <p className="text-xs font-bold text-[var(--accent)]">{category}の条件を自分の言葉で</p>
      <input
        autoFocus
        value={text}
        onChange={(event) => {
          if (event.target.value.length <= CUSTOM_SPEC_MAX_LENGTH) {
            setText(event.target.value);
          }
        }}
        placeholder="例: デート代を出してくれる"
        className="mt-2 w-full rounded-lg border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--text-sub)]">
          {text.length}/{CUSTOM_SPEC_MAX_LENGTH}
        </span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={reset} className="text-xs font-bold text-[var(--text-sub)]">
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!text.trim()}
            className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
