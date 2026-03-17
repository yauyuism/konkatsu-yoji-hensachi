import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";

type HensachiIntroScreenProps = {
  onStart: () => void;
};

const sampleStats = [
  { label: "総合偏差値", value: "62", accent: "var(--accent)" },
  { label: "称号", value: "恋のスナイパー", accent: "#F97316" },
  { label: "会話力", value: "65", accent: "#3B82F6" },
  { label: "見極め力", value: "38", accent: "#6B7280" },
];

export function HensachiIntroScreen({ onStart }: HensachiIntroScreenProps) {
  return (
    <section className="screen-shell relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="absolute left-[-4rem] top-12 h-40 w-40 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-24 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.12)] blur-3xl" />

      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
        <div className="relative z-10 flex h-full flex-col">
          <div>
            <p className="eyebrow inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
              APP HENSACHI
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-[3.45rem]">
              あなたの <span className="text-[var(--accent)]">マッチングアプリ偏差値は？</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
              16の質問に答えるだけ。あなたのアプリ力が数値で暴かれる。
              成績表みたいに見えるけど、中身はちゃんと笑える診断です。
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-sub)]">
              <span className="soft-pill">全16問</span>
              <span className="soft-pill">約3分</span>
              <span className="soft-pill">無料</span>
              <span className="soft-pill">登録不要</span>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex flex-col items-center gap-3 rounded-[16px] border border-[var(--color-border)] bg-white p-3">
                <button
                  type="button"
                  onClick={onStart}
                  className="btn-primary min-h-[4.2rem] min-w-[17rem] rounded-[10px] px-9 py-5 text-lg font-black"
                >
                  今すぐ測定する
                </button>
                <p className="text-center text-sm font-medium leading-6 text-[var(--text-sub)]">
                  3分くらいで終わります。結果はすぐ出ます。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-xl lg:mt-auto">
            <CreatorFollowPanel
              context="hensachi_intro"
              quizName="app_hensachi"
              title="@yauyuism / note"
              description="診断結果を読んで終わりにしない人向けに、Xでは短文の気づき、noteでは長文の言語化を更新しています。"
              compact
            />
          </div>
        </div>

        <div className="relative flex h-full">
          <div className="paper-card relative flex h-full w-full flex-col overflow-hidden rounded-[16px] p-5 sm:p-7">
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(0deg,transparent_0_18%,rgba(26,26,26,0.05)_18%_19%,transparent_19%_100%),linear-gradient(90deg,transparent_0_13%,rgba(26,26,26,0.04)_13%_14%,transparent_14%_100%)]" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium tracking-[0.12em] text-[var(--text-sub)]">成績表サンプル</p>
                <div className="rounded-full bg-[rgba(232,69,60,0.08)] px-3 py-1 text-[0.7rem] font-bold tracking-[0.18em] text-[var(--accent)]">
                  SAMPLE
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                <p className="text-center text-[0.72rem] font-bold tracking-[0.2em] text-[var(--text-sub)]">マッチングアプリ偏差値</p>
                <p className="number-display mt-4 text-center text-7xl font-black leading-none text-[var(--accent)] sm:text-[5.5rem]">
                  62
                </p>
                <p className="mt-3 text-center text-2xl font-bold text-[var(--text-main)] sm:text-3xl">恋のスナイパー</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {sampleStats.map((stat, index) => (
                    <div
                      key={`${stat.label}-${index}`}
                      className="rounded-[12px] border border-[var(--color-border)] px-4 py-4"
                    >
                      <p className="text-xs font-bold tracking-[0.14em] text-[var(--text-sub)]">{stat.label}</p>
                      <p className="number-display mt-2 text-3xl font-black leading-none sm:text-4xl" style={{ color: stat.accent }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 border-t border-[var(--color-border)] pt-6 text-sm leading-7 text-[var(--text-sub)] lg:mt-auto">
                総合偏差値、5つの科目別スコア、称号、総評までまとめて出ます。低めでも笑って見返せる温度感で作っています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
