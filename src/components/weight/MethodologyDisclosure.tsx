export function MethodologyDisclosure() {
  return (
    <details className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <summary className="cursor-pointer list-none text-2xl font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
        計算ロジック
      </summary>

      <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--text-main)]">
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          基礎重量 = 1.0kg
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          文量バランス = max(0, 自分の総文字数 / 相手の総文字数 - 1.0) × 1.2kg
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          質問密度 = max(0, 自分の質問ありメッセージ率 - 0.25) × 3.0kg
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          絵文字温度差 = max(0, 自分の1通あたり絵文字数 - 相手の1通あたり絵文字数) × 0.8kg
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          話題起点率 = max(0, 自分の新話題率 - 0.5) × 2.5kg
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4">
          メッセージ長偏差 = max(0, 1通あたり文字数の標準偏差 - 30) × 0.015kg
        </div>
      </div>

      <div className="mt-5 rounded-[1.4rem] bg-[rgba(248,247,244,0.92)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
        AI はスクショやテキストから会話を構造化してコメントを返すだけで、重量の数字を決めていません。重量そのものは上の式で固定計算しています。
      </div>

      <div className="mt-4 rounded-[1.4rem] bg-[rgba(248,247,244,0.92)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
        スクショに映る名前やアイコンは分析対象に含めず、画像もテキストもサーバー保存しません。匿名統計として残すのは重量や内訳などの数値だけです。
      </div>

      <div className="mt-4 rounded-[1.4rem] bg-[rgba(248,247,244,0.92)] px-4 py-4 text-xs leading-6 text-[var(--text-sub)]">
        参考文献（企画メモ記載）: Scissors et al. (2008), Toma & Hancock (2012)
      </div>
    </details>
  );
}
