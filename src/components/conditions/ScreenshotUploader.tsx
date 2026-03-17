"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type ScreenshotUploaderProps = {
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  onSelectFile: (file: File) => void;
  onRead: () => void;
  disabled?: boolean;
  isReading?: boolean;
};

export function ScreenshotUploader({
  previewUrl,
  fileName,
  error,
  onSelectFile,
  onRead,
  disabled = false,
  isReading = false,
}: ScreenshotUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) {
      return;
    }

    onSelectFile(file);
  };

  return (
    <section className="paper-card rounded-[1.8rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_42px_rgba(26,26,26,0.06)] sm:p-6">
      <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 2</p>
      <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">検索条件の設定画面を貼り付ける</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
        画像はサーバーに保存しません。条件の読み取りが終わったら、そのまま破棄します。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        data-testid="screenshot-file-input"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        data-testid="screenshot-dropzone"
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(event.dataTransfer.files?.[0] ?? null);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`mt-5 flex min-h-[16rem] w-full flex-col items-center justify-center rounded-[1.8rem] border-2 border-dashed px-5 py-8 text-center transition ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[rgba(26,26,26,0.12)] bg-white/75"
        }`}
      >
        {previewUrl ? (
          <div className="w-full">
            <div className="relative mx-auto h-64 max-w-[18rem] overflow-hidden rounded-[1rem] border border-[rgba(26,26,26,0.08)] shadow-[0_14px_34px_rgba(26,26,26,0.08)]">
              <Image
                src={previewUrl}
                alt="検索条件スクリーンショットのプレビュー"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm font-bold text-[var(--text-main)]">{fileName}</p>
            <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">タップで画像を差し替え</p>
          </div>
        ) : (
          <>
            <div className="text-5xl">📱</div>
            <p className="mt-4 text-lg font-black text-[var(--text-main)]">ここに画像をドラッグ or タップ</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">検索条件が見える状態のスクショを選んでください</p>
          </>
        )}
      </button>

      {error ? (
        <p className="mt-4 rounded-[1rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-bold text-[var(--accent)]">
          {error}
        </p>
      ) : null}

      <details className="mt-4 rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white/82 px-4 py-4">
        <summary className="cursor-pointer text-sm font-black text-[var(--text-main)]">スクショの撮り方</summary>
        <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-sub)]">
          <p>1. アプリの検索条件設定を開く</p>
          <p>2. 条件が見える状態でスクリーンショットを撮る</p>
          <p>3. この画面で画像を選ぶ</p>
        </div>
      </details>

      <button
        type="button"
        onClick={onRead}
        disabled={disabled || isReading}
        data-testid="screenshot-read-button"
        className="cta-button mt-5 inline-flex w-full items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isReading ? "読み取っています..." : "読み取る"}
      </button>
    </section>
  );
}
