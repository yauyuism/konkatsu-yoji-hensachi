"use client";

type WeightAnalyzingScreenProps = {
  phaseText: string;
  inputMode: "images" | "text";
};

export function WeightAnalyzingScreen({ phaseText, inputMode }: WeightAnalyzingScreenProps) {
  return (
    <section className="screen-shell mx-auto max-w-4xl px-4 pb-6 pt-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="paper-card rounded-[2.2rem] border border-[color:var(--line)] bg-[var(--card)] px-6 py-12 text-center shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:px-8 sm:py-16">
          <div className="ink-loader mx-auto" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="mt-8 text-sm font-bold tracking-[0.24em] text-[var(--accent)]">ANALYZING</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--text-main)] sm:text-4xl">{phaseText}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-sub)] sm:text-base">
            {inputMode === "images"
              ? "スクショから吹き出しを読み取り、会話の構造だけを抽出しています。"
              : "会話の構造だけを拾って、文量差や話題起点率を計測しています。"}
          </p>
        </div>
      </div>
    </section>
  );
}
