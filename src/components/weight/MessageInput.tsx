"use client";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  messageCount: number;
  charCount: number;
  maxLength: number;
};

export function MessageInput({ value, onChange, messageCount, charCount, maxLength }: MessageInputProps) {
  return (
    <div>
      <label htmlFor="weight-message-input" className="sr-only">
        やりとりを貼り付け
      </label>
      <textarea
        id="weight-message-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={`[名前A] 14:32
こんにちは！今日はありがとう
[名前B] 14:35
こちらこそ！楽しかったです

自分: 今日は空いてる？
相手: 夜なら大丈夫`}
        className="min-h-[12rem] w-full rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white px-4 py-4 text-sm leading-7 text-[var(--text-main)] outline-none transition focus:border-[rgba(232,69,60,0.24)] focus:ring-4 focus:ring-[rgba(232,69,60,0.08)] sm:min-h-[14rem] sm:px-5 sm:py-5 sm:text-base"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-bold text-[var(--text-main)]">メッセージ数: {messageCount}通</p>
        <p className="text-[var(--text-sub)]">
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} 文字
        </p>
      </div>
      <p className="mt-3 text-xs leading-6 text-[var(--text-sub)]">うまく分かれないときは `自分:` `相手:` を付けると読み取りやすくなります。</p>
    </div>
  );
}
