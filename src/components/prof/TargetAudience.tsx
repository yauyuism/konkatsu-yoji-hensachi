import type { TargetAudience as TargetAudienceType } from "@/lib/prof";

type TargetAudienceProps = {
  audience: TargetAudienceType;
};

export function TargetAudience({ audience }: TargetAudienceProps) {
  const blocks = [
    {
      icon: "🎯",
      title: "ど真ん中で刺さる層",
      body: audience.main,
      accent: "border-[rgba(232,69,60,0.16)] bg-[var(--accent-soft)]",
    },
    {
      icon: "📌",
      title: "意外と反応する層",
      body: audience.sub,
      accent: "border-[rgba(59,130,246,0.16)] bg-[rgba(59,130,246,0.06)]",
    },
  ];

  return (
    <div className="grid gap-4">
      {blocks.map((block) => (
        <section key={block.title} className={`rounded-[1.6rem] border p-5 ${block.accent}`}>
          <p className="text-sm font-bold tracking-[0.12em] text-[var(--text-main)]">
            {block.icon} {block.title}
          </p>
          <p className="mt-3 text-sm font-bold tracking-[0.08em] text-[var(--text-sub)]">
            {block.body.ageRange} / {block.body.occupation}
          </p>
          <p className="mt-2 text-lg font-black leading-8 text-[var(--text-main)]">{block.body.persona}</p>
          <p className="mt-3 rounded-[1rem] bg-white/70 px-4 py-3 text-sm leading-7 text-[var(--text-main)]">
            {block.body.appHistory}
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-[var(--text-main)]">{block.body.personality}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{block.body.reason}</p>
        </section>
      ))}

      <section className="rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/86 p-5">
        <p className="text-sm font-bold tracking-[0.12em] text-[var(--text-main)]">⚠️ 今のプロフだと届かない層</p>
        <p className="mt-3 text-lg font-black text-[var(--text-main)]">{audience.miss.type}</p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{audience.miss.reason}</p>
        <p className="mt-3 rounded-[1rem] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm leading-7 text-[#047857]">
          → {audience.miss.improvementHint}
        </p>
      </section>
    </div>
  );
}
