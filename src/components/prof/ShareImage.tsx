import { forwardRef } from "react";

type ShareImageProps = {
  appLabel: string;
  total: number;
};

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(function ShareImage(
  { appLabel, total },
  ref
) {
  return (
    <div
      ref={ref}
      className="rounded-[1.8rem] border border-[color:var(--line)] bg-white p-6"
    >
      <p className="text-center text-xs font-bold tracking-[0.22em] text-[var(--accent)]">マッチングアプリ プロフ偏差値診断</p>

      <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(232,69,60,0.08),rgba(59,130,246,0.06))] px-5 py-8 text-center">
        <div className="inline-flex rounded-full border border-[rgba(26,26,26,0.08)] bg-white/90 px-4 py-2 text-sm font-black text-[var(--text-main)]">
          {appLabel}
        </div>
        <p className="mt-5 text-2xl font-black text-[var(--text-main)] sm:text-3xl">プロフィール偏差値</p>
        <p className="mt-2 text-sm font-bold tracking-[0.08em] text-[var(--text-sub)]">{appLabel}のプロフ文をAIが5項目で分析</p>
        <p className="font-numeric mt-7 text-[5.2rem] font-black leading-none text-[var(--text-main)] sm:text-[6.2rem]">
          {total}
          <span className="ml-1 text-[2.1rem] sm:text-[2.4rem]">点</span>
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>#プロフ偏差値</span>
        <span>@yauyuism</span>
      </div>
    </div>
  );
});
