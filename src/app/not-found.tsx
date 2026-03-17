import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="screen-shell mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow rounded-full px-4 py-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)]">
        404 NOT FOUND
      </p>
      <h1 className="mt-5 text-3xl font-black text-[var(--text-main)] sm:text-4xl">ページが見つかりません</h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-sub)] sm:text-base">
        URLを確認するか、トップページからもう一度診断してください。
      </p>
      <Link
        href="/"
        className="cta-button mt-8 inline-flex items-center justify-center rounded-[1.2rem] px-6 py-3 text-sm font-bold text-white"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
