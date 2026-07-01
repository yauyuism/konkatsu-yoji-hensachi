"use client";

import { trackEvent } from "@/lib/analytics";
import { CONSULTATION_STORE_URL } from "@/lib/service-links";

type StorePlacement = "final_cta" | "flow" | "header" | "plans";
type DiagnosisKind = "konkatsu_fatigue" | "deai_fit";

export function FirstViewConsultationLink() {
  const handleClick = () => {
    trackEvent("consultation_lp_first_cta_click", {
      label: "相談内容を見る",
    });
  };

  return (
    <a
      data-testid="consultation-first-cta"
      href="#service"
      onClick={handleClick}
      className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-black sm:text-base"
    >
      相談内容を見る
    </a>
  );
}

export function ConsultationStoreButton({
  children,
  placement,
  className,
}: {
  children: string;
  placement: StorePlacement;
  className?: string;
}) {
  const handleClick = () => {
    trackEvent("consultation_lp_store_click", {
      placement,
    });
  };

  return (
    <a
      data-testid="consultation-store-cta"
      href={CONSULTATION_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={
        className ??
        "btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-black sm:text-base"
      }
    >
      {children}
    </a>
  );
}

export function ConsultationDiagnosisLink({
  children,
  diagnosis,
  href,
}: {
  children: string;
  diagnosis: DiagnosisKind;
  href: string;
}) {
  const handleClick = () => {
    trackEvent("consultation_lp_diagnosis_click", {
      diagnosis,
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="secondary-button mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--text-main)]"
    >
      {children}
    </a>
  );
}
