"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky-header sticky top-0 z-50 border-b border-[color:rgba(229,231,235,0.95)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-bold tracking-[0.18em] text-[var(--color-text)]">
          SHINDAN LAB
        </Link>
        <Link href="/" className="text-sm text-[var(--color-text-sub)] transition hover:text-[var(--color-text)]">
          診断一覧
        </Link>
      </div>
    </header>
  );
}
