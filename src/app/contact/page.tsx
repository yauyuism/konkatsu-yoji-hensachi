import type { Metadata } from "next";
import type { ReactNode } from "react";

import { InfoPageShell } from "@/components/InfoPageShell";
import { getCreatorLinks } from "@/lib/creator-links";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "婚活診断LAB by アイカタへの感想、不具合報告、削除依頼、取材・掲載相談の連絡先です。",
  alternates: {
    canonical: "/contact",
  },
};

function ContactSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
      <h2 className="text-xl font-black text-[var(--text-main)] sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-sub)] sm:text-base">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  const { noteUrl, xUrl } = getCreatorLinks();

  return (
    <InfoPageShell
      eyebrow="CONTACT"
      title="お問い合わせ"
      description="感想、不具合報告、掲載相談、削除依頼などの連絡先です。現時点では、X と note を窓口にしています。"
    >
      <ContactSection title="連絡先">
        <p>恋愛・婚活のヒントや更新を追いたい人は X、まとまったコラムを読みたい人は note が向いています。お問い合わせも、まずは下記リンクからお願いします。</p>
        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
          >
            Xで @yauyuism を開く
          </a>
          <a
            href={noteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
          >
            noteで @yauyuism を開く
          </a>
        </div>
      </ContactSection>

      <ContactSection title="こんな連絡を受け付けています">
        <p>診断の感想、改善案、表示崩れや保存失敗などの不具合報告、記事掲載や紹介の相談、プライバシーに関する問い合わせ、削除依頼などです。</p>
      </ContactSection>

      <ContactSection title="不具合報告であると助かる情報">
        <p>使った端末名、OS、ブラウザ、問題が起きたページ、何を押したときに起きたか、スクリーンショット、結果URLがあると確認が速くなります。</p>
      </ContactSection>

      <ContactSection title="補足">
        <p>公開アカウント経由でのやり取りになるため、個人情報や機微情報は送らないでください。プロフィール本文の削除相談などは、該当ページや日時がわかる情報だけを送ってください。</p>
        <p>返信の早さは一定ではありません。内容によっては返答できない場合があります。</p>
      </ContactSection>
    </InfoPageShell>
  );
}
