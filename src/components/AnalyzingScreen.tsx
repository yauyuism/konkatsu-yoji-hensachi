type AnalyzingScreenProps = {
  phaseText: string;
};

export function AnalyzingScreen({ phaseText }: AnalyzingScreenProps) {
  return (
    <section className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <div className="paper-card rounded-[2.2rem] border border-[color:var(--line)] bg-[var(--card)] px-6 py-12 text-center shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:px-8 sm:py-16">
          <div className="ink-loader mx-auto" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="mt-8 text-sm font-bold tracking-[0.24em] text-[var(--accent)]">ANALYZING</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--text-main)] sm:text-4xl">{phaseText}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-sub)] sm:text-base">
            墨をのばして、いちばんしっくりくる四字を探しています。
          </p>
        </div>
      </div>
    </section>
  );
}
