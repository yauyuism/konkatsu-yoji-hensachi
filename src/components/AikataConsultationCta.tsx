import Link from "next/link";

type AikataConsultationCtaProps = {
  className?: string;
  compact?: boolean;
};

export function AikataConsultationCta({ className = "", compact = false }: AikataConsultationCtaProps) {
  return (
    <section
      data-testid="aikata-consultation-cta"
      className={`rounded-[1.4rem] border border-[rgba(143,183,161,0.34)] bg-[linear-gradient(135deg,rgba(220,233,223,0.72),rgba(255,250,245,0.94))] p-5 sm:p-6 ${className}`.trim()}
    >
      <p className="text-xs font-black tracking-[0.18em] text-[var(--mint-green)]">AIKATA CONSULTATION</p>
      <h2 className={`${compact ? "mt-2 text-xl" : "mt-3 text-2xl"} font-black leading-tight text-[var(--text-main)]`}>
        診断結果をもとに、あなたに合う出会い方を一緒に整理したい方へ
      </h2>
      <p className="mt-3 text-sm leading-8 text-[var(--text-main)] sm:text-base">
        アイカタでは、マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場まで含めて、あなたに合う出会い方を一緒に設計します。
      </p>
      <div className="mt-5">
        <Link href="/consultation" className="btn-primary inline-flex rounded-[1rem] px-5 py-3 text-sm font-black">
          60分婚活相談はこちら
        </Link>
      </div>
    </section>
  );
}
