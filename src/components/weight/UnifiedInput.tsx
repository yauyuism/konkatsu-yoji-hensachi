"use client";

import { type ClipboardEvent, useRef, useState } from "react";

import { ImageThumbnails } from "@/components/weight/ImageThumbnails";
import { MessageInput } from "@/components/weight/MessageInput";

type UnifiedInputMode = "idle" | "images" | "text";

type UnifiedInputProps = {
  mode: UnifiedInputMode;
  textValue: string;
  imageFiles: File[];
  messageCount: number;
  maxTextLength: number;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onTextChange: (value: string) => void;
  onTextPaste: (value: string) => void;
  onSwitchToText: () => void;
  onSwitchToImages: () => void;
};

const MAX_IMAGE_COUNT = 5;

export function UnifiedInput({
  mode,
  textValue,
  imageFiles,
  messageCount,
  maxTextLength,
  onAddImages,
  onRemoveImage,
  onTextChange,
  onTextPaste,
  onSwitchToText,
  onSwitchToImages,
}: UnifiedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) {
      return;
    }

    onAddImages(Array.from(files));
  };

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    const items = Array.from(event.clipboardData.items);
    const imageFilesFromPaste = items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (imageFilesFromPaste.length > 0) {
      event.preventDefault();
      onAddImages(imageFilesFromPaste);
      return;
    }

    const pastedText = event.clipboardData.getData("text/plain").trim();
    if (pastedText) {
      event.preventDefault();
      onTextPaste(pastedText);
    }
  };

  const renderDropZone = ({
    title,
    description,
    compact = false,
  }: {
    title: string;
    description: string;
    compact?: boolean;
  }) => (
    <button
      type="button"
      onClick={openFilePicker}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onPaste={handlePaste}
      className={`flex w-full flex-col items-center justify-center rounded-[1.8rem] border-2 border-dashed px-5 text-center transition ${
        isDragging
          ? "border-[var(--color-main)] bg-[var(--accent-soft)]"
          : "border-[rgba(26,26,26,0.14)] bg-white/84"
      } ${compact ? "min-h-[9rem] py-5" : "min-h-[18rem] py-8 sm:min-h-[20rem]"}`}
    >
      <div className={compact ? "text-3xl" : "text-5xl"}>📱</div>
      <p className={`font-black text-[var(--text-main)] ${compact ? "mt-3 text-base" : "mt-5 text-xl"}`}>{title}</p>
      <p className={`leading-7 text-[var(--text-sub)] ${compact ? "mt-2 text-sm" : "mt-2 text-sm"}`}>{description}</p>

      {!compact ? (
        <>
          <div className="mt-5 flex w-full max-w-xs items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-sub)]">
            <span className="h-px flex-1 bg-[rgba(26,26,26,0.12)]" />
            または
            <span className="h-px flex-1 bg-[rgba(26,26,26,0.12)]" />
          </div>

          <p className="mt-5 text-sm font-bold text-[var(--text-main)]">テキストを直接ペースト</p>
          <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">貼り付けると自動でテキスト入力に切り替わります</p>
        </>
      ) : (
        <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">ドロップ、タップ、または画像をペーストして追加できます</p>
      )}
    </button>
  );

  const renderIdle = () =>
    renderDropZone({
      title: "LINEのスクショをここにドロップ",
      description: "またはタップして画像を選択",
    });

  const renderImages = () => (
    <div className="rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4 sm:p-5">
      <ImageThumbnails files={imageFiles} maxCount={MAX_IMAGE_COUNT} onRemove={onRemoveImage} />

      {imageFiles.length < MAX_IMAGE_COUNT ? (
        <div className="mt-4">
          {renderDropZone({
            title: `スクショを追加（${imageFiles.length}/${MAX_IMAGE_COUNT}枚）`,
            description: "最大5枚まで追加できます",
            compact: true,
          })}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          onClick={onSwitchToText}
          className="text-[var(--text-sub)] underline decoration-[rgba(26,26,26,0.2)] underline-offset-4"
        >
          テキストで貼りたい場合はこちら
        </button>
      </div>
    </div>
  );

  const renderText = () => (
    <div className="rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4 sm:p-5">
      <MessageInput
        value={textValue}
        onChange={onTextChange}
        messageCount={messageCount}
        charCount={textValue.length}
        maxLength={maxTextLength}
      />

      <button
        type="button"
        onClick={onSwitchToImages}
        className="mt-3 text-sm text-[var(--text-sub)] underline decoration-[rgba(26,26,26,0.2)] underline-offset-4"
      >
        スクショで貼りたい場合はこちら
      </button>
    </div>
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      {mode === "idle" ? renderIdle() : null}
      {mode === "images" ? renderImages() : null}
      {mode === "text" ? renderText() : null}

      <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">
        スクショは最大5枚まで。画像・テキストともにサーバーに保存されません。
      </p>

      <details className="mt-4 rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-[rgba(248,247,244,0.92)] px-4 py-4">
        <summary className="cursor-pointer list-none text-sm font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
          スクショの撮り方
        </summary>
        <div className="mt-3 grid gap-3 text-sm leading-7 text-[var(--text-sub)]">
          <p>LINEのトーク画面を開いてスクリーンショットを撮るだけです。会話が長いなら複数枚に分けてください。</p>
          <p>吹き出しがしっかり見えるほど読み取りやすくなります。目安は10通以上です。</p>
          <p>スクショに映る名前やアイコンは分析対象にせず、結果にも出しません。</p>
        </div>
      </details>
    </div>
  );
}
