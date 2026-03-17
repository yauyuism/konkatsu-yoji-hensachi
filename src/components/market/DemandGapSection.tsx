import Link from "next/link";

type StoredConditionResult = {
  count: number;
};

type DemandGapSectionProps = {
  demandCount: number;
  demandShare: number;
  conditionResult: StoredConditionResult | null;
};

function getGapTone(gap: number) {
  if (gap >= 2) {
    return {
      label: "かなり自分有利",
      color: "var(--positive)",
      background: "rgba(16,185,129,0.08)",
      headline: "あなたは「選ぶ側」にいます。",
      message:
        "あなたを条件内に入れる人のほうがかなり多い状態です。止まっているなら、問題はスペックよりプロフィールや会話の見せ方に寄っている可能性が高いです。",
    };
  }

  if (gap >= 1) {
    return {
      label: "やや自分有利",
      color: "var(--positive)",
      background: "rgba(16,185,129,0.08)",
      headline: "あなたは「選ぶ側」に近い位置です。",
      message: "婚活倍率は悪くありません。ここから先は、写真、プロフィール文、会う前のやり取りを整えると通りやすくなります。",
    };
  }

  return {
    label: "見直し余地あり",
    color: "var(--neutral)",
    background: "rgba(245,158,11,0.12)",
    headline: "あなたが求めている人のほうが多いです。",
    message: "不利というより、条件を少し絞りすぎている状態です。条件を1つ見直すだけで倍率がかなり変わる余地があります。",
  };
}

export function DemandGapSection({ demandCount, demandShare, conditionResult }: DemandGapSectionProps) {
  if (!conditionResult || conditionResult.count <= 0) {
    return (
      <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
        <h2 className="text-2xl font-black text-[var(--text-main)]">婚活倍率</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
          今のスペックを条件内に入れやすい相手は、今の地域だけでも約 {demandCount.toLocaleString()} 人です。地域内の未婚異性に対する比率で見ると
          {` ${demandShare.toFixed(1)}%`} くらいです。
        </p>

        <div className="mt-5 rounded-[1.5rem] border border-[rgba(59,130,246,0.14)] bg-[rgba(59,130,246,0.06)] p-5">
          <p className="text-sm font-bold tracking-[0.16em] text-[#1D4ED8]">条件チェッカーと組み合わせる</p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">
            条件チェッカーで相手への条件を入れると、「あなたが求めている人数」と「あなたを条件内に入れる人数」を並べて婚活倍率として見られます。
          </p>
          <Link
            href="/conditions"
            className="cta-button mt-5 inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-white"
          >
            条件チェッカーをやる →
          </Link>
        </div>
      </section>
    );
  }

  const gap = demandCount / conditionResult.count;
  const tone = getGapTone(gap);

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-main)]">婚活倍率</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
            条件チェッカーの結果と、今回のスペック換算を同時に見ています。
          </p>
        </div>
        <div
          className="rounded-full px-4 py-2 text-xs font-black tracking-[0.12em]"
          style={{ color: tone.color, background: tone.background }}
        >
          {tone.label}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[color:var(--line)] bg-white">
        <div className="grid divide-y divide-[color:var(--line)] sm:grid-cols-[1fr_auto_1fr] sm:divide-x sm:divide-y-0">
          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたが求めている相手</p>
            <p className="number-display mt-3 text-4xl font-black text-[var(--text-main)]">{conditionResult.count.toLocaleString()}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">条件チェッカーで残った人数</p>
          </div>

          <div className="p-5 text-center" style={{ background: tone.background }}>
            <p className="text-xs font-bold tracking-[0.16em]" style={{ color: tone.color }}>
              婚活倍率
            </p>
            <p className="number-display mt-3 text-5xl font-black leading-none" style={{ color: tone.color }}>
              {gap.toFixed(1)}倍
            </p>
          </div>

          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたを条件内に入れやすい相手</p>
            <p className="number-display mt-3 text-4xl font-black text-[var(--text-main)]">{demandCount.toLocaleString()}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">地域内の未婚異性に推計許容率を掛けた概算</p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[color:var(--line)] pt-5">
        <p className="text-base font-black" style={{ color: tone.color }}>
          {tone.headline}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">{tone.message}</p>
      </div>
    </section>
  );
}
