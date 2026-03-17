import Link from "next/link";

type ToolCardProps = {
  label: string;
  title: string;
  description: string;
  tags?: string[];
  href: string;
  isNew?: boolean;
  highlightBadge?: string;
  ctaLabel?: string;
  className?: string;
};

export function ToolCard({
  label,
  title,
  description,
  tags = [],
  href,
  isNew = false,
  highlightBadge,
  ctaLabel = "診断を開く →",
  className = "",
}: ToolCardProps) {
  return (
    <Link href={href} className={`card card-interactive group relative flex h-full flex-col p-6 sm:p-7 ${className}`.trim()}>
      {isNew || highlightBadge ? (
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          {highlightBadge ? (
            <span className="tag bg-[rgba(59,130,246,0.12)] text-[#1D4ED8]">{highlightBadge}</span>
          ) : null}
          {isNew ? (
            <span className="rounded-md bg-[var(--color-main)] px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white">
              NEW
            </span>
          ) : null}
        </div>
      ) : null}

      <p className="font-numeric text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{label}</p>
      <h3 className="mt-2 text-[1.05rem] font-bold leading-7 text-[var(--color-text)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-sub)]">{description}</p>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <p className="text-link mt-auto pt-5">{ctaLabel}</p>
    </Link>
  );
}
