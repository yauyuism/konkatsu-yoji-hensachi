import Link from "next/link";

import { getLiveTools } from "@/data/tools";
import { getCreatorLinks } from "@/lib/creator-links";
import { MOSH_SERVICES_URL } from "@/lib/service-links";

const footerLinkClass =
  "text-sm leading-7 text-[var(--text-sub)] transition-colors hover:text-[var(--text-main)]";

export function SiteFooter() {
  const { noteUrl, xUrl } = getCreatorLinks();
  const tools = getLiveTools();

  return (
    <footer className="mx-auto mt-16 w-full max-w-6xl border-t border-[color:var(--line)] px-4 pb-10 pt-8 sm:px-6 sm:pb-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <p className="text-sm font-black tracking-[0.18em] text-[var(--accent)]">婚活診断LAB by やうゆ</p>
          <p className="mt-3 text-sm leading-8 text-[var(--text-main)] sm:text-base">
            婚活・恋愛の癖を知る無料診断メディア。
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
            診断は、あなたを採点するためのものではありません。自分に合わない頑張り方を見直し、自分に合う出会い方を知るための入口です。
          </p>
          <a href={MOSH_SERVICES_URL} target="_blank" rel="noopener noreferrer" className="text-link mt-4 inline-flex">
            診断結果を個別に整理する →
          </a>
        </div>

        <div>
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">サイト内リンク</p>
          <div className="mt-3 grid gap-1">
            <Link href="/" className={footerLinkClass}>
              診断トップ
            </Link>
            {tools.map((tool) => (
              <Link key={tool.id} href={tool.path} className={footerLinkClass}>
                {tool.name}
              </Link>
            ))}
            <Link href="/privacy" className={footerLinkClass}>
              プライバシーポリシー
            </Link>
            <Link href="/contact" className={footerLinkClass}>
              お問い合わせ
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">個別に整理したい方へ</p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
            マチアプ、相談所、紹介、SNS、外飲みまで含めて、婚活の進め方を見直す相談です。
          </p>
          <div className="mt-3 grid gap-1">
            <a href={MOSH_SERVICES_URL} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              やうゆ式 婚活の見直し相談
            </a>
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              X: @yauyuism
            </a>
            <a href={noteUrl} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              note: @yauyuism
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-[color:var(--line)] pt-4 text-xs leading-6 text-[var(--text-sub)] sm:flex sm:items-center sm:justify-between">
        <p>© 2026 yauyuism</p>
        <p>診断内容や案内文は、運用に合わせて更新することがあります。</p>
      </div>
    </footer>
  );
}
