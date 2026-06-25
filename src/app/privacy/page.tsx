import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "婚活診断LAB by やうゆで扱う情報、利用目的、外部サービス、結果URLやお問い合わせ方法についての案内です。",
  alternates: {
    canonical: "/privacy",
  },
};

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
      <h2 className="text-xl font-black text-[var(--text-main)] sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-sub)] sm:text-base">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="PRIVACY"
      title="プライバシーポリシー"
      description="このサイトでは、診断体験の提供、改善、利用状況の把握のために必要な範囲で情報を取り扱います。以下は、現時点の実装に基づく案内です。"
    >
      <PolicySection title="1. 取得する情報">
        <p>
          質問型の偏差値診断では、回答内容と診断結果がブラウザ上で計算されます。Google Analytics 4 を設定している場合は、開始、回答、結果表示、シェア、外部リンククリックなどのイベントを送信します。
        </p>
        <p>
          プロフィール偏差値診断では、入力されたプロフィール文、年齢、性別、利用アプリ情報を分析のためにサーバーへ送信します。分析処理には Anthropic API を利用します。
        </p>
        <p>
          条件リアリティチェックのスクショ読み取り機能を使う場合は、検索条件設定画面の画像を一時的にサーバーへ送信し、Anthropic API で条件抽出を行います。画像は保存せず、読み取り用途のみに使います。
        </p>
        <p>
          条件リアリティチェックでは、結果画面を表示したときに、入力方式、性別、年齢幅、年収条件、身長条件、学歴、エリア、推計人数、割合、影響が大きい条件などを匿名の統計データとして保存することがあります。
        </p>
        <p>
          不正利用対策のため、Vercel KV を有効にしている場合は、IP アドレスをもとにしたレート制限情報を一定時間保存することがあります。
        </p>
      </PolicySection>

      <PolicySection title="2. 保存する情報と保存しない情報">
        <p>
          プロフィール偏差値診断では、プロフィール本文を結果URLに含めません。運営側でプロフィール本文を恒久保存する設計にはしていませんが、通信やクラウド基盤上で一時的に処理される場合があります。
        </p>
        <p>
          条件リアリティチェックのスクショ画像も、結果URLには含めません。サーバー側で保存する前提にはしていませんが、通信やクラウド基盤上で一時的に処理される場合があります。
        </p>
        <p>
          匿名統計を有効にしている場合は、年齢帯、性別、利用アプリ、文字数、偏差値、改善幅、カテゴリ別の傾向、条件設定、推計人数、割合など、個人を直接特定しにくい集計用データのみを保存します。スクショ画像そのものや氏名、メールアドレス、電話番号などの連絡先を収集する設計にはしていません。
        </p>
      </PolicySection>

      <PolicySection title="3. 利用目的">
        <p>取得した情報は、診断結果の表示、機能改善、エラー調査、利用状況の把握、不正利用の抑制、匿名統計の作成のために利用します。</p>
        <p>恋愛・婚活に関する助言を提供するサービスではありますが、医療、法律、身元確認のような目的での判定には使いません。</p>
      </PolicySection>

      <PolicySection title="4. 外部サービス">
        <p>
          アクセス解析には Google Analytics 4、AI分析には Anthropic API、ホスティングと一部データ保存には Vercel / Vercel KV を利用しています。各サービスでの取り扱いは、それぞれの提供元のポリシーにも従います。
        </p>
      </PolicySection>

      <PolicySection title="5. 入力時のお願い">
        <p>
          プロフィール文を貼り付ける際は、氏名、勤務先、住所、連絡先、SNS ID など、本人や第三者を特定しうる情報は含めないでください。機微情報の入力も避けてください。
        </p>
        <p>
          スクショ読み取りに使う画像は、検索条件設定画面のみにしてください。プロフィール一覧や他人の顔写真、氏名が映り込んだ画面の送信は避けてください。
        </p>
      </PolicySection>

      <PolicySection title="6. 結果URLとSNSシェア">
        <p>
          質問型偏差値診断の結果URLには、5科目のスコアがクエリパラメータとして含まれます。プロフ診断の結果URLには、偏差値系の数値のみを含み、原文は含みません。
        </p>
        <p>シェア時は、利用者自身の判断で公開してください。公開後の拡散先までは運営側で管理できません。</p>
      </PolicySection>

      <PolicySection title="7. 改定とお問い合わせ">
        <p>このポリシーは、実装や運用の変更に合わせて更新することがあります。大きな変更があった場合は、サイト上で反映します。</p>
        <p>
          削除依頼や不具合報告、運営への連絡は、
          <Link className="font-bold text-[var(--accent)]" href="/contact">
            お問い合わせページ
          </Link>
          から確認してください。
        </p>
        <p>最終更新日: 2026年3月12日</p>
      </PolicySection>
    </InfoPageShell>
  );
}
