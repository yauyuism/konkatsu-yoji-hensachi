"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky-header sticky top-0 z-50 border-b border-[color:rgba(229,231,235,0.95)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="leading-tight text-[var(--color-text)]">
          <span className="block text-sm font-black tracking-[0.12em]">婚活診断LAB</span>
          <span className="block text-[10px] font-bold tracking-[0.08em] text-[var(--accent)]">by アイカタ</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[var(--color-text-sub)]">
          <Link href="/#tool-list" className="transition hover:text-[var(--color-text)]">
            診断一覧
          </Link>
          <Link href="/consultation" className="font-bold text-[var(--accent)] transition hover:text-[var(--color-text)]">
            60分相談
          </Link>
        </nav>
      </div>
    </header>
  );
}
