"use client";

import { supportedApps, type SupportedApp } from "@/lib/convert-filter";

type AppSelectorProps = {
  value: SupportedApp | null;
  onChange: (value: SupportedApp) => void;
};

export function AppSelector({ value, onChange }: AppSelectorProps) {
  return (
    <section className="paper-card rounded-[1.8rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_42px_rgba(26,26,26,0.06)] sm:p-6">
      <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 1</p>
      <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">アプリを選択</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">UI の癖を読むヒントとして使います。正確さは画像そのものが優先です。</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {supportedApps.map((app) => {
          const active = value === app.value;

          return (
            <button
              key={app.value}
              type="button"
              onClick={() => onChange(app.value)}
              data-testid={`screenshot-app-${app.value}`}
              className={`choice-button rounded-[1.2rem] border px-4 py-4 text-sm font-black transition ${
                active
                  ? "border-[rgba(232,69,60,0.24)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[rgba(26,26,26,0.08)] bg-white/88 text-[var(--text-main)]"
              }`}
            >
              {app.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
