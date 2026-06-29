import Link from "next/link";

import { ConsultationDiagnosisLink, ConsultationMoshButton, FirstViewConsultationLink } from "@/components/consultation/ConsultationActions";
import { buildShareMetadata } from "@/lib/metadata";

const diagnosisTopUrl = "https://www.shindanlab.jp/";

const empathyItems = [
  "マチアプで会えないわけではない",
  "紹介がまったくないわけでもない",
  "相談所に入れば誰かとは会える気もする",
  "でも、なぜか進まない",
  "会ったあとに疲れる",
  "いい人なのに好きになれない",
  "LINEを返すだけで重い",
  "プロフィールを見ているうちに、誰がいいのか分からなくなる",
  "相談所に入るべきか迷っている",
];

const serviceItems = [
  "なぜ会えるのに進まないのか",
  "どの段階で疲れているのか",
  "プロフィールの入口でズレていないか",
  "マチアプが合っているのか",
  "相談所に入る前に何を整理すべきか",
  "紹介・SNS・外飲みなど、別の出会い方が合う可能性はあるか",
  "自分はどんな速度で人を好きになりやすいのか",
];

const organizeCards = [
  {
    title: "婚活疲れの原因",
    body: "判断が早すぎるのか、条件で見すぎているのか、相手に合わせすぎているのか。今どこで疲れているのかを整理します。",
  },
  {
    title: "自分に合う出会い方",
    body: "マチアプ、相談所、紹介、SNS、外飲みなど、どんな出会い方なら自然に人を見られるのかを整理します。",
  },
  {
    title: "プロフィールや入口のズレ",
    body: "プロフィールで合わない人を呼び込んでいないか、自分の魅力が伝わりやすい入口になっているかを見ます。",
  },
  {
    title: "次に取るべき行動",
    body: "マチアプを続けるのか、相談所に入るのか、紹介を増やすのか、生活圏を広げるのか。次の動きを整理します。",
  },
];

const talkExamples = [
  "今使っているマチアプが自分に合っているか",
  "相談所に入るべきか、まだ早いのか",
  "プロフィールで合わない人を呼び込んでいないか",
  "会ったあとに疲れる理由は何か",
  "いい人なのに好きになれない理由は何か",
  "どんな人を好きになりやすいのか",
  "紹介・SNS・外飲みなどをどう使えばいいか",
  "次に会う人をどう判断すればいいか",
  "今の婚活を続けるべきか、一度見直すべきか",
];

const fitItems = [
  "マチアプで会えるけど進まない",
  "いい人なのに好きになれない",
  "会ったあとに疲れる",
  "婚活を頑張るほど自信がなくなる",
  "相談所に入るべきか迷っている",
  "自分に合う出会い方が分からない",
  "プロフィール添削だけでは足りない気がしている",
  "婚活の進め方を一度客観的に見直したい",
];

const notFitItems = [
  "すぐに相手を紹介してほしい人",
  "結婚相談所のような紹介サービスを求めている人",
  "必ず成婚させてほしい人",
  "恋愛の正解を一方的に決めてほしい人",
  "厳しいダメ出しだけを求めている人",
];

const flowItems = [
  {
    title: "MOSHから申し込み",
    body: "希望する相談メニューを選び、MOSHからお申し込みください。",
  },
  {
    title: "事前に状況を共有",
    body: "可能であれば、今の悩み、使っているアプリ、プロフィール、診断結果などを事前に共有してください。",
  },
  {
    title: "60分で婚活を整理",
    body: "会えるのに進まない理由、疲れているポイント、自分に合う出会い方を一緒に整理します。",
  },
  {
    title: "次にやることを決める",
    body: "相談後、マチアプを続けるのか、相談所を検討するのか、紹介や生活圏を増やすのか、次の動きを整理します。",
  },
];

const sessionInfoItems = [
  ["相談時間", "60分"],
  ["形式", "オンライン"],
  ["予約・決済", "MOSH"],
];

const diagnosisCards = [
  {
    title: "婚活疲れ・マチアプ疲れ診断",
    description: "会えるのに進まない理由や、今どこで疲れているのかを診断します。",
    href: "https://www.shindanlab.jp/diagnoses/konkatsu-fatigue",
    button: "会えるのに進まない理由を診断する",
    diagnosis: "konkatsu_fatigue" as const,
  },
  {
    title: "あなたに合う出会い方診断",
    description: "マチアプ、紹介、SNS、外飲みなど、どんな出会い方が合うかを診断します。",
    href: "https://www.shindanlab.jp/diagnoses/deai-fit",
    button: "自分に合う出会い方を診断する",
    diagnosis: "deai_fit" as const,
  },
];

const faqs = [
  {
    question: "結婚相談所ですか？",
    answer: "違います。相手を紹介するサービスではありません。今の婚活の進め方や出会い方を整理する相談です。",
  },
  {
    question: "マチアプをやめた方がいいと言われますか？",
    answer:
      "一律でやめた方がいいとは言いません。マチアプが合う人もいます。ただ、今の使い方や出会い方が合っているかは一緒に整理します。",
  },
  {
    question: "相談所に入るか迷っていても相談できますか？",
    answer:
      "できます。相談所に入る前に、自分が何を求めているのか、どんな出会い方が合うのかを整理しておくと判断しやすくなります。",
  },
  {
    question: "プロフィールも見てもらえますか？",
    answer: "相談内容によっては見られます。プロフィールだけをしっかり見たい場合は、プロフィール添削メニューも検討してください。",
  },
  {
    question: "恋愛経験が少なくても大丈夫ですか？",
    answer: "大丈夫です。経験の多さより、今どこで困っているのかを一緒に整理することを大事にしています。",
  },
];

export const metadata = buildShareMetadata({
  title: "婚活のセカンドオピニオン｜会えるのに進まない理由を、出会い方から整理する相談",
  absoluteTitle: true,
  description:
    "マチアプ疲れ・婚活疲れ・いい人なのに好きになれない違和感を、相手選びの前に出会い方から見直す相談です。",
  path: "/consultation",
  imagePath: "/api/og-consultation",
  imageAlt: "婚活のセカンドオピニオンのOGP画像",
  ogTitle: "婚活のセカンドオピニオン｜婚活診断LAB by やうゆ",
  ogDescription: "会えるのに進まない理由を、相手選びの前に出会い方から整理する相談です。",
});

function DiagnosisButton({ children }: { children: string }) {
  return (
    <a
      data-testid="consultation-diagnosis-cta"
      href={diagnosisTopUrl}
      className="secondary-button inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 py-3.5 text-sm font-black text-[var(--text-main)] sm:text-base"
    >
      {children}
    </a>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--text-main)] sm:text-3xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-8 text-[var(--text-sub)] sm:text-base">{description}</p> : null}
    </div>
  );
}

function CheckList({ items, subtle = false }: { items: string[]; subtle?: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 rounded-[1rem] border px-4 py-3 text-sm leading-7 ${
            subtle
              ? "border-[rgba(26,26,26,0.08)] bg-white text-[var(--text-sub)]"
              : "border-[rgba(232,69,60,0.12)] bg-white text-[var(--text-main)]"
          }`}
        >
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ConsultationPage() {
  return (
    <div data-testid="consultation-page" className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <section className="grid gap-8 rounded-[1.8rem] border border-[rgba(232,69,60,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,245,240,0.92)_58%,rgba(248,247,244,0.96))] p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">婚活のセカンドオピニオン</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
            会えるのに進まない理由を、
            <span className="block">
              <span className="text-[var(--accent)]">出会い方から整理</span>します。
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            マチアプ疲れ・婚活疲れ・いい人なのに好きになれない違和感を、相手選びの前に「出会い方」から見直します。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <FirstViewConsultationLink />
            <DiagnosisButton>無料診断を試す</DiagnosisButton>
          </div>
        </div>

        <aside className="rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/86 p-5 sm:p-6">
          <p className="text-sm font-black tracking-[0.14em] text-[var(--accent)]">NOT MORE EFFORT</p>
          <p className="mt-4 text-2xl font-black leading-tight text-[var(--text-main)]">もっと頑張る前に、頑張り方を見直す。</p>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--text-sub)]">
            <p>これは結婚相談所ではありません。</p>
            <p>相手を紹介するサービスでもありません。</p>
            <p className="font-bold text-[var(--text-main)]">合っていない頑張り方をやめるための、婚活の見直し相談です。</p>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:p-6">
          <p className="text-sm font-black tracking-[0.14em] text-[var(--accent)]">SESSION INFO</p>
          <p className="mt-3 text-sm leading-8 text-[var(--text-main)]">
            60分のオンライン相談です。料金・空き日程はMOSHで確認できます。
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          {sessionInfoItems.map(([label, value]) => (
            <div key={label} className="rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-4">
              <dt className="text-xs font-bold tracking-[0.14em] text-[var(--text-sub)]">{label}</dt>
              <dd className="mt-2 text-lg font-black text-[var(--text-main)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="CHECK" title="こんな状態ではありませんか？" />
        <div className="mt-6">
          <CheckList items={empathyItems} />
        </div>
        <div className="mt-6 rounded-[1.2rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] p-5 text-sm leading-8 text-[var(--text-main)] sm:p-6 sm:text-base">
          <p>それは、あなたの魅力不足や努力不足だけで起きているとは限りません。</p>
          <p className="mt-3">自分に合わない出会い方や、合わない判断の速度の中で頑張っているだけかもしれません。</p>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="REDEFINE" title="婚活疲れの原因は、相手選びだけではありません。" />
        <div className="mt-6 grid gap-4 text-sm leading-8 text-[var(--text-main)] sm:text-base">
          <p>婚活では、つい「誰を選ぶか」に意識が向きます。</p>
          <p>年齢、年収、身長、学歴、居住地、結婚観、子ども観。もちろん条件を見ることは大切です。</p>
          <p>でも、会えるのに進まない人の多くは、相手選びの前に「出会い方」でズレています。</p>
          <p>最初から一対一で恋愛対象として会う方が楽な人もいれば、何度か同じ場で顔を合わせる中で少しずつ好きになる人もいます。</p>
          <p>会う前に条件を確認したい人もいれば、会った時の空気感で見たい人もいます。</p>
          <p>早く進めたい人もいれば、ゆっくり気持ちが育つ方が自然な人もいます。</p>
          <p>
            つまり、婚活のしんどさは「相手がいない」だけではなく、「自分に合わない出会い方を続けている」ことで起きることがあります。
          </p>
        </div>
        <p className="mt-7 rounded-[1.2rem] bg-white px-5 py-4 text-xl font-black leading-tight text-[var(--accent)] sm:text-2xl">
          相手選びの前に、出会い方選び。
        </p>
      </section>

      <section id="service" className="mt-12 scroll-mt-20 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="SERVICE" title="この相談でやること" />
        <div className="mt-6 grid gap-4 text-sm leading-8 text-[var(--text-main)] sm:text-base">
          <p>婚活のセカンドオピニオンでは、相手を紹介することはしません。</p>
          <p>結婚相談所のように、条件に合う人を紹介するサービスでもありません。</p>
          <p>やることは、今の婚活の進め方を一緒に整理することです。</p>
        </div>
        <div className="mt-6">
          <CheckList items={serviceItems} />
        </div>
        <div className="mt-6 rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white p-5 text-sm leading-8 text-[var(--text-main)] sm:p-6 sm:text-base">
          <p className="font-black">婚活をもっと頑張らせる相談ではありません。</p>
          <p className="mt-3">合っていない頑張り方をやめるための相談です。</p>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="ORGANIZE" title="相談で整理できること" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {organizeCards.map((card) => (
            <article key={card.title} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:p-6">
              <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">{card.title}</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading
          eyebrow="TALK TOPICS"
          title="実際に相談で話せること"
          description="相談内容がきれいにまとまっていなくても大丈夫です。今の状況を聞きながら、どこで詰まっているのかを一緒に整理します。"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {talkExamples.map((item) => (
            <div key={item} className="flex gap-3 rounded-[1rem] border border-[rgba(232,69,60,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 border-t border-[var(--line)] pt-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="FIT" title="この相談が向いている人" />
          <div className="mt-6">
            <CheckList items={fitItems} />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="NOT FOR" title="この相談が向いていない人" />
          <div className="mt-6">
            <CheckList items={notFitItems} subtle />
          </div>
          <p className="mt-5 rounded-[1rem] bg-white px-4 py-4 text-sm leading-8 text-[var(--text-sub)]">
            この相談は、正解を押しつけるものではありません。今の婚活を一緒に整理し、自分に合う進め方を見つけるための相談です。
            合う・合わないを確認したうえで、必要な人だけ使ってもらえれば大丈夫です。
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="FLOW" title="相談の流れ" />
        <ol className="mt-6 grid gap-4">
          {flowItems.map((item, index) => (
            <li key={item.title} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:grid sm:grid-cols-[5.5rem_1fr] sm:gap-5 sm:p-6">
              <p className="font-numeric text-sm font-black tracking-[0.18em] text-[var(--accent)]">STEP {index + 1}</p>
              <div className="mt-3 sm:mt-0">
                <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <ConsultationMoshButton placement="flow">料金・空き日程をMOSHで確認する</ConsultationMoshButton>
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading
          eyebrow="FREE DIAGNOSIS"
          title="まずは無料診断からでも大丈夫です。"
          description="いきなり相談する前に、自分の状態を見たい人向けに無料診断も用意しています。"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {diagnosisCards.map((card) => (
            <article key={card.title} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:p-6">
              <h3 className="text-lg font-black leading-tight text-[var(--text-main)]">{card.title}</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">{card.description}</p>
              <ConsultationDiagnosisLink href={card.href} diagnosis={card.diagnosis}>
                {card.button}
              </ConsultationDiagnosisLink>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <SectionHeading eyebrow="FAQ" title="よくある質問" />
        <div className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-5 sm:p-6">
              <summary className="cursor-pointer list-none text-base font-black leading-7 text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
                Q. {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-8 text-[var(--text-sub)]">A. {faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[1.8rem] border border-[rgba(232,69,60,0.18)] bg-[linear-gradient(135deg,rgba(255,245,240,0.96),rgba(255,255,255,0.98))] p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">NEXT ACTION</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--text-main)] sm:text-4xl">
          会えるのに進まない理由を、自分の場合で整理してみませんか？
        </h2>
        <div className="mt-6 grid gap-4 text-sm leading-8 text-[var(--text-main)] sm:text-base">
          <p>診断では見えた違和感を、実際のプロフィール・出会い方・相手選びに落とし込むための相談です。</p>
          <p>婚活がしんどい時、人はすぐに自分を責めます。</p>
          <p>自分に魅力がないのか。理想が高いのか。見る目がないのか。恋愛に向いていないのか。</p>
          <p>でも、そう決める前に、一度だけ見てほしいです。</p>
          <p>出会い方が合っているのか。判断の速度が合っているのか。プロフィールの入口が合っているのか。相手に合わせすぎていないか。</p>
          <p className="font-bold">婚活疲れは、努力不足ではなく、合わない頑張り方を続けているサインかもしれません。</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ConsultationMoshButton placement="final_cta">MOSHで相談を申し込む</ConsultationMoshButton>
          <DiagnosisButton>無料診断から試す</DiagnosisButton>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm font-bold text-[var(--text-sub)] transition hover:text-[var(--text-main)]">
          診断トップへ戻る
        </Link>
      </div>
    </div>
  );
}
