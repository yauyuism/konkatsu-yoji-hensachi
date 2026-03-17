"use client";

import { useEffect, useRef } from "react";

import { profAppOptions, type AnalyzeRequest } from "@/lib/prof";

type InputFormProps = {
  value: AnalyzeRequest;
  onChange: (value: AnalyzeRequest) => void;
  onSubmit: (value: AnalyzeRequest) => void;
  isSubmitting?: boolean;
  error?: string | null;
};

const profilePlaceholder = `プロフィールをそのままコピペしてください。例：

都内でWebマーケの仕事をしています。
休みの日は代々木公園でランニングしたり、
Netflixで海外ドラマを観てます。
最近は友達に誘われてゴルフを始めました。
美味しいもの好きなので、いいお店があったら
教えてください！`;

const MIN_AGE = 18;
const MAX_AGE = 60;

export function InputForm({ value, onChange, onSubmit, isSubmitting = false, error }: InputFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const profileLength = value.profileText.trim().length;
  const ageText = Number.isFinite(value.age) ? String(value.age) : "";
  const isAgeInvalid = !Number.isInteger(value.age) || value.age < MIN_AGE || value.age > MAX_AGE;
  const isTooShort = profileLength > 0 && profileLength < 30;
  const isTooLong = profileLength > 1500;
  const canSubmit = !isSubmitting && !isAgeInvalid && profileLength >= 30 && profileLength <= 1500;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(160, textarea.scrollHeight)}px`;
  }, [value.profileText]);

  const setField = <K extends keyof AnalyzeRequest>(key: K, nextValue: AnalyzeRequest[K]) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const toggleApp = (app: (typeof profAppOptions)[number]["value"]) => {
    const nextApps = value.apps.includes(app)
      ? value.apps.filter((item) => item !== app)
      : [...value.apps, app];

    setField("apps", nextApps);
  };

  const handleAgeChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 2);

    if (!digits) {
      setField("age", Number.NaN as AnalyzeRequest["age"]);
      return;
    }

    setField("age", Number(digits) as AnalyzeRequest["age"]);
  };

  return (
    <section data-testid="prof-input-form" className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
      <div className="grid gap-8">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 1</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--text-main)] sm:text-3xl">基本情報</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_180px]">
            <div>
              <p className="text-sm font-bold text-[var(--text-main)]">あなたの性別</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { value: "male", label: "男性" },
                  { value: "female", label: "女性" },
                ].map((option) => {
                  const selected = value.gender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField("gender", option.value as AnalyzeRequest["gender"])}
                      className={`choice-button rounded-[1.2rem] border px-4 py-4 text-sm font-bold ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[color:var(--line)] bg-white/85 text-[var(--text-main)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="profile-age" className="text-sm font-bold text-[var(--text-main)]">
                あなたの年齢
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-[1.2rem] border border-[color:var(--line)] bg-white/88 px-4 py-3">
                <input
                  id="profile-age"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="28"
                  value={ageText}
                  onChange={(event) => handleAgeChange(event.target.value)}
                  className="w-full border-none bg-transparent text-lg font-bold text-[var(--text-main)] outline-none"
                />
                <span className="text-sm font-bold text-[var(--text-sub)]">歳</span>
              </div>
              <p className={`mt-2 text-xs font-medium ${isAgeInvalid ? "text-[var(--accent)]" : "text-[var(--text-sub)]"}`}>
                18歳〜60歳で入力してください
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-bold text-[var(--text-main)]">使っているアプリ（複数可）</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {profAppOptions.map((app) => {
                const selected = value.apps.includes(app.value);
                return (
                  <button
                    key={app.value}
                    type="button"
                    onClick={() => toggleApp(app.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[color:var(--line)] bg-white/88 text-[var(--text-sub)] hover:border-[rgba(232,69,60,0.3)]"
                    }`}
                  >
                    {app.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(26,26,26,0.08)]" />

        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 2</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--text-main)] sm:text-3xl">プロフィール文を貼り付け</h2>

          <div className="mt-5 rounded-[1.6rem] border border-[color:var(--line)] bg-white/88 p-4 sm:p-5">
            <textarea
              ref={textareaRef}
              data-testid="profile-textarea"
              value={value.profileText}
              onChange={(event) => setField("profileText", event.target.value)}
              placeholder={profilePlaceholder}
              className="min-h-[160px] w-full resize-none border-none bg-transparent text-sm leading-8 text-[var(--text-main)] outline-none sm:text-base"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className={`${isTooShort || isTooLong ? "text-[var(--accent)]" : "text-[var(--text-sub)]"}`}>
              文字数: {profileLength} / 1500
            </p>
            <p className="text-[var(--text-sub)]">※ プロフ原文はサーバーに保存されません</p>
          </div>

          {error ? <p className="mt-4 text-sm font-bold text-[var(--accent)]">{error}</p> : null}
          {isTooShort ? (
            <p className="mt-4 text-sm font-bold text-[var(--accent)]">
              もう少し長いプロフ文を貼り付けてください（30文字以上）
            </p>
          ) : null}
          {isTooLong ? <p className="mt-4 text-sm font-bold text-[var(--accent)]">1500文字以内にしてください</p> : null}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              data-testid="profile-submit"
              disabled={!canSubmit}
              onClick={() => onSubmit(value)}
              className="cta-button inline-flex items-center justify-center rounded-[1.35rem] px-7 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "分析中..." : "診断する"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
