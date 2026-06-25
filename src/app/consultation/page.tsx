import { buildShareMetadata } from "@/lib/metadata";
import { MOSH_SERVICES_URL } from "@/lib/service-links";

const reservationUrl = MOSH_SERVICES_URL;

const recommendedItems = [
  "マッチングアプリで会っても好きになれない",
  "結婚相談所に入るべきか迷っている",
  "条件は合うのにピンと来ない",
  "婚活を頑張っているのに疲れてきた",
  "自分に合う出会い方を知りたい",
  "次の2週間で何をすればいいか整理したい",
];

const consultationItems = [
  "今の婚活状況の整理",
  "マチアプ、結婚相談所、紹介、SNS、外飲み、趣味の場の向き不向き整理",
  "好きになれない理由、続かない理由の見立て",
  "過去の恋愛や曖昧な関係の整理",
  "自分に合う出会い方の提案",
  "次の2週間で試す行動の整理",
];

const flowItems = [
  "事前に今の婚活状況を簡単に共有",
  "60分オンライン相談",
  "現状整理と見立て",
  "自分に合う出会い方の提案",
  "次の2週間で試す行動を決める",
];

const pricingItems = [
  ["相談時間", "60分"],
  ["料金", "11,000円（税込）"],
  ["形式", "オンライン相談"],
  ["相談後", "今日の見立てと次に試す行動を簡単にまとめてお送りします"],
];

const fitItems = [
  "自分に合う出会い方を知りたい人",
  "婚活を頑張っているのに疲れている人",
  "指摘を受け止めながら前に進みたい人",
  "受け身で待つだけではなく、自分でも動く意思がある人",
];

const notFitItems = [
  "何もせずに結婚相手を紹介してほしい方には、少し合いにくい相談です",
  "自分は一切変えず、相手だけを変えたい場合は、効果を感じにくいかもしれません",
  "相手や市場のせいだけにしたい気持ちが強い時は、少し時間を置いてからの方が向いています",
  "アドバイスを受けても行動する予定がない場合は、まず休むことを優先しても大丈夫です",
];

const faqs = [
  {
    question: "結婚相談所に入る前提ですか？",
    answer:
      "いいえ。60分相談では、結婚相談所、マッチングアプリ、紹介、SNS、外飲み、趣味の場まで含めて、今のあなたに合う出会い方を一緒に整理します。",
  },
  {
    question: "顔出しは必要ですか？",
    answer: "オンライン相談のため、基本的にはカメラありをおすすめしています。事情がある場合は事前にご相談ください。",
  },
  {
    question: "相談後に無理な勧誘はありますか？",
    answer:
      "ありません。必要に応じて継続相談をご案内することはありますが、無理に案内することはありません。",
  },
  {
    question: "何を準備すればいいですか？",
    answer:
      "今使っているアプリのプロフィール、過去の婚活状況、最近会った人との違和感などがあれば、相談前に共有いただけると整理しやすいです。",
  },
];

export const metadata = buildShareMetadata({
  title: "やうゆ式 婚活の見直し相談",
  description: "診断結果をもとに、自分に合う出会い方と次に試す行動を整理する婚活の見直し相談です。",
  path: "/consultation",
  imagePath: "/api/og-top",
  imageAlt: "やうゆ式 婚活の見直し相談",
  ogTitle: "やうゆ式 婚活の見直し相談 | 婚活診断LAB by やうゆ",
  ogDescription: "診断結果をもとに、あなたに合う会い方と次の2週間で試す行動を一緒に整理します。",
});

function ReservationButton({ label = "60分婚活相談を予約する" }: { label?: string }) {
  return (
    <a
      data-testid="consultation-reservation-cta"
      href={reservationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary min-h-12 rounded-full px-6 py-3.5 text-sm font-black sm:text-base"
    >
      {label}
    </a>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--mint-green)]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-8 text-[var(--text-sub)] sm:text-base">{description}</p> : null}
    </div>
  );
}

function CheckList({ items, tone = "mint" }: { items: string[]; tone?: "mint" | "pink" }) {
  const markerClass = tone === "mint" ? "bg-[var(--mint-green)]" : "bg-[var(--clayed-pink)]";

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--text-main)]">
          <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${markerClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ConsultationPage() {
  return (
    <main data-testid="consultation-page" className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <section className="grid gap-8 rounded-[1.8rem] border border-[rgba(143,183,161,0.34)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,245,0.96)_52%,rgba(220,233,223,0.58))] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--mint-green)]">YAUYU CONSULTATION</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">60分婚活相談</h1>
          <div className="mt-6 grid gap-4 text-sm leading-8 text-[var(--text-main)] sm:text-base">
            <p>婚活がしんどいのは、あなたが悪いからではなく、自分に合わない頑張り方を続けているからかもしれません。</p>
            <p>
              やうゆ式の婚活の見直し相談では、マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場まで含めて、あなたに合う出会い方と、次に試す行動を一緒に整理します。
            </p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ReservationButton />
            <p className="text-xs font-bold leading-6 text-[var(--text-sub)]">オンライン / 60分 / 11,000円（税込）</p>
          </div>
        </div>

        <aside className="rounded-[1.4rem] border border-[rgba(63,52,46,0.1)] bg-white/82 p-5 sm:p-6">
          <p className="text-sm font-black tracking-[0.14em] text-[var(--accent)]">FROM DIAGNOSIS TO ACTION</p>
          <p className="mt-4 text-2xl font-black leading-tight text-[var(--text-main)]">診断結果を、次に動くための設計図に。</p>
          <dl className="mt-6 grid gap-3">
            {pricingItems.slice(0, 3).map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3 text-sm">
                <dt className="font-bold text-[var(--text-sub)]">{label}</dt>
                <dd className="text-right font-black text-[var(--text-main)]">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="RECOMMENDED" title="こんな方におすすめ" />
        <div className="mt-6">
          <CheckList items={recommendedItems} />
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="SESSION" title="相談でできること" />
        <div className="mt-6">
          <CheckList items={consultationItems} tone="pink" />
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading
          eyebrow="PHILOSOPHY"
          title="相談の考え方"
          description="受け身で待つだけの婚活ではなく、自分に合う会い方を見つけ、実際に動きながら結婚につながる関係を作っていくための相談です。"
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">頑張り方を一緒に設計する</h3>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              頑張れない人を無理に動かすのではなく、頑張る気持ちがある人に、自分に合う頑張り方を一緒に設計します。
            </p>
          </article>
          <article className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">普通の婚活に合わせすぎない</h3>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              普通の婚活に、自分を合わせなくていい。いい相方に出会うには、自分に合う会い方がいる。
            </p>
          </article>
          <article className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">次の行動まで決める</h3>
            <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">
              自己理解で終わらせず、次の2週間で試す行動まで落とし込むことで、婚活を動かしやすくします。
            </p>
          </article>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="FLOW" title="相談の流れ" />
        <ol className="mt-6 grid gap-3">
          {flowItems.map((item, index) => (
            <li key={item} className="flex gap-4 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-numeric text-sm font-black text-[var(--accent)]">
                {index + 1}
              </span>
              <span className="pt-0.5 font-bold">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-6 border-t border-[var(--line)] pt-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading eyebrow="PRICE" title="料金・形式" description="相談後は、今日の見立てと次に試す行動を簡単にまとめてお送りします。" />
        <dl className="grid gap-3">
          {pricingItems.map(([label, value]) => (
            <div key={label} className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-sm font-bold text-[var(--text-sub)]">{label}</dt>
              <dd className="mt-2 text-sm font-black leading-7 text-[var(--text-main)] sm:mt-0">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 grid gap-8 border-t border-[var(--line)] pt-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="FIT" title="向いている人" />
          <div className="mt-6">
            <CheckList items={fitItems} />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="NOT FOR" title="向いていない人" />
          <div className="mt-6">
            <CheckList items={notFitItems} tone="pink" />
          </div>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="FAQ" title="よくある質問" />
        <div className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:p-6">
              <h3 className="text-base font-black leading-7 text-[var(--text-main)]">Q. {faq.question}</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">A. {faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[1.8rem] border border-[rgba(201,130,120,0.28)] bg-[linear-gradient(135deg,rgba(248,235,231,0.92),rgba(255,255,255,0.94),rgba(220,233,223,0.58))] p-6 text-center sm:p-8 lg:p-10">
        <p className="text-xs font-black tracking-[0.18em] text-[var(--mint-green)]">NEXT ACTION</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-4xl">診断結果を、次の行動に変えたい方へ</h2>
        <div className="mx-auto mt-5 grid max-w-3xl gap-3 text-sm leading-8 text-[var(--text-main)] sm:text-base">
          <p>診断は、自分を採点するためのものではありません。自分に合わない頑張り方を見直し、自分に合う出会い方を知るための入口です。</p>
          <p>60分婚活相談では、診断結果をもとに、あなたに合う会い方と次の行動を一緒に整理します。</p>
        </div>
        <div className="mt-7">
          <ReservationButton />
        </div>
      </section>
    </main>
  );
}
