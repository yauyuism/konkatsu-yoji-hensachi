type SealStampProps = {
  className?: string;
};

export function SealStamp({ className = "" }: SealStampProps) {
  return (
    <div
      className={`seal-stamp flex h-16 w-16 items-center justify-center rounded-[1.2rem] border-2 border-[var(--accent)] bg-[var(--accent-soft)] text-[0.95rem] font-black tracking-[0.18em] text-[var(--accent)] shadow-[0_10px_24px_rgba(232,69,60,0.16)] ${className}`}
      aria-label="やうゆ"
    >
      やうゆ
    </div>
  );
}
