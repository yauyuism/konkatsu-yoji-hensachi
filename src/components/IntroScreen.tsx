type IntroScreenProps = {
  onStart: () => void;
};

const sampleWords = ["条件迷宮", "直感成婚", "婚活仙人", "既読放置"];

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <section className="screen-shell relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="absolute left-[-4rem] top-12 h-40 w-40 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-24 h-48 w-48 rounded-full bg-[rgba(249,115,22,0.1)] blur-3xl" />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative z-10">
          <p className="eyebrow inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
            KONKATSU YOJI
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
            あなたの婚活を
            <span className="block text-[var(--accent)]">四字熟語で表すと</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            10の質問に答えるだけ。あなたの婚活の本質が、たった四文字に。
            重い悩みは、まず笑える言葉に変えてから眺める。
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-sub)]">
            <span className="soft-pill rounded-full px-4 py-2">全10問</span>
            <span className="soft-pill rounded-full px-4 py-2">約2分</span>
            <span className="soft-pill rounded-full px-4 py-2">無料</span>
            <span className="soft-pill rounded-full px-4 py-2">登録不要</span>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="cta-button mt-8 inline-flex items-center justify-center rounded-[1.35rem] px-7 py-4 text-base font-black text-white"
          >
            診断する
          </button>
        </div>

        <div className="relative">
          <div className="paper-card relative overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_32px_80px_rgba(26,26,26,0.08)] sm:p-7">
            <div className="absolute right-5 top-5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[0.7rem] font-bold tracking-[0.18em] text-[var(--accent)]">
              SAMPLE
            </div>

            <p className="text-sm font-medium tracking-[0.12em] text-[var(--text-sub)]">
              たとえば、こんな四字熟語が出ます。
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {sampleWords.map((word, index) => (
                <div
                  key={word}
                  className={`floating-card rounded-[1.6rem] border px-4 py-5 text-center shadow-[0_18px_40px_rgba(26,26,26,0.07)] ${
                    index % 2 === 0
                      ? "border-[rgba(232,69,60,0.16)] bg-[var(--accent-soft)]"
                      : "border-[rgba(249,115,22,0.16)] bg-[var(--accent-subtle)]"
                  }`}
                >
                  <p className="font-display text-[1.9rem] tracking-[0.18em] text-[var(--text-main)] sm:text-[2.2rem]">
                    {word}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-dashed border-[rgba(26,26,26,0.12)] bg-white/70 p-4 text-sm leading-7 text-[var(--text-sub)]">
              条件に迷う人、疲れて悟った人、直感で駆け抜ける人。婚活のクセをポップに言語化します。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
