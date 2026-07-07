"use client";

import { trackEvent } from "@/lib/analytics";
import { CONSULTATION_STORE_URL } from "@/lib/service-links";

type StoreConsultationCtaKind = "consultation" | "profile" | "deai" | "twoSessions";

type StoreConsultationCtaProps = {
  placement: string;
  quizName?: string;
  resultType?: string;
  ctaKind?: StoreConsultationCtaKind;
  variant?: "default" | "compact" | "soft";
  className?: string;
};

const ctaCopy: Record<StoreConsultationCtaKind, { title: string; body: string[]; button: string }> = {
  consultation: {
    title: "診断だけでは分かりきらないこともあります。",
    body: [
      "今の出会い方を続けるべきか。プロフィールを変えるべきか。相談所に入る前に整理したほうがいいのか。",
      "個別に見たい人は、やうゆ式の婚活の見直し相談で一緒に話せます。",
    ],
    button: "婚活の見直し相談を見る",
  },
  profile: {
    title: "プロフィールの点数より大事なのは、誰に届いているかです。",
    body: ["文章・写真・並びを見直して、あなたと合う人に届くプロフィールにしたい人は、60分相談の中で一緒に見直せます。"],
    button: "プロフィールを相談する",
  },
  deai: {
    title: "自分に合う出会い方を、個別に整理したい人へ。",
    body: [
      "診断では大まかな傾向が分かります。",
      "ただ、実際にはプロフィール、使っているアプリ、過去の恋愛、相談所に入るかどうか、外飲みや紹介への向き不向きまで見ると、出会い方はもっと具体的に整理できます。",
      "マチアプ、相談所、紹介、SNS、外飲みまで含めて、無理しない進め方を一緒に考えたい人は、やうゆ式の婚活の見直し相談で話せます。",
    ],
    button: "自分に合う出会い方を相談する",
  },
  twoSessions: {
    title: "話して終わりではなく、動いた後の迷いまで整えたい人へ。",
    body: [
      "整理したあとも、婚活は小さな判断の連続です。",
      "会うべきか、2回目に行くべきか。迷ったとき公式LINEで何度でも相談できる、定額の「相談し放題」があります。",
    ],
    button: "相談し放題を見る",
  },
};

export function StoreConsultationCta({
  placement,
  quizName,
  resultType,
  ctaKind = "consultation",
  variant = "default",
  className = "",
}: StoreConsultationCtaProps) {
  const copy = ctaCopy[ctaKind];
  const isCompact = variant === "compact";
  const isSoft = variant === "soft";

  const handleClick = () => {
    trackEvent("consultation_cta_click", {
      placement,
      quiz_name: quizName,
      result_type: resultType,
      cta_kind: ctaKind,
    });
  };

  return (
    <section
      data-testid="store-consultation-cta"
      className={`${isSoft ? "soft-panel" : "card"} overflow-hidden rounded-[1.4rem] p-5 sm:p-6 ${className}`.trim()}
    >
      <p className="text-xs font-black tracking-[0.18em] text-[var(--accent)]">NEXT STEP</p>
      <h2 className={`${isCompact ? "mt-2 text-xl" : "mt-3 text-2xl sm:text-3xl"} font-black leading-tight text-[var(--color-text)]`}>
        {copy.title}
      </h2>
      <div className={`${isCompact ? "mt-3" : "mt-4"} grid gap-3 text-sm leading-8 text-[var(--color-text-sub)] sm:text-base`}>
        {copy.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <a
        href={CONSULTATION_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="btn-primary mt-6 inline-flex min-h-12 rounded-full px-6 py-3.5 text-sm font-black"
      >
        {copy.button}
      </a>
    </section>
  );
}
