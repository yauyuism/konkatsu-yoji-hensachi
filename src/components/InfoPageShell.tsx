import Link from "next/link";
import type { ReactNode } from "react";

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function InfoPageShell({ eyebrow, title, description, children }: InfoPageShellProps) {
  return (
    <section className="screen-shell relative mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="absolute left-[-4rem] top-10 h-48 w-48 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-28 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.1)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-[rgba(26,26,26,0.08)] bg-white/80 px-4 py-2 text-sm font-bold text-[var(--text-sub)]"
        >
          診断トップへ戻る
        </Link>

        <p className="eyebrow mt-6 inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>

        <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">{description}</p>

        <div className="mt-8 grid gap-4">{children}</div>
      </div>
    </section>
  );
}
