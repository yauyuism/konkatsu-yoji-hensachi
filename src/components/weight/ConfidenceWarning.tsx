"use client";

type ConfidenceWarningProps = {
  messageCount: number;
  onContinue: () => void;
  onAddScreenshots: () => void;
  onSwitchToText: () => void;
};

export function ConfidenceWarning({
  messageCount,
  onContinue,
  onAddScreenshots,
  onSwitchToText,
}: ConfidenceWarningProps) {
  return (
    <section className="paper-card rounded-[2rem] border border-[rgba(245,158,11,0.2)] bg-[rgba(255,251,235,0.94)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <p className="text-sm font-bold tracking-[0.16em] text-[#C2410C]">読み取り精度に注意</p>
      <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">このまま測るか、スクショを足すか選べます</h2>
      <p className="mt-3 text-sm leading-8 text-[var(--text-main)]">
        読み取れたメッセージは {messageCount}通 です。少なすぎる場合は、結果が不安定になることがあります。
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onContinue}
          className="cta-button rounded-[1.2rem] px-5 py-4 text-sm font-black text-white"
        >
          このまま測定する
        </button>
        <button
          type="button"
          onClick={onAddScreenshots}
          className="secondary-button rounded-[1.2rem] px-5 py-4 text-sm font-black text-[var(--text-main)]"
        >
          スクショを追加する
        </button>
        <button
          type="button"
          onClick={onSwitchToText}
          className="soft-button rounded-[1.2rem] px-5 py-4 text-sm font-black text-[var(--text-main)]"
        >
          テキストで貼り直す
        </button>
      </div>
    </section>
  );
}
