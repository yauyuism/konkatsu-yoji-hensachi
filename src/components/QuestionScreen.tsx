type QuestionPreview = {
  id: number;
  question: string;
  choices: Array<{
    text: string;
  }>;
};

type QuestionScreenProps = {
  question: QuestionPreview;
  questionIndex: number;
  totalQuestions: number;
  currentChoiceIndex: number | null;
  selectedChoiceIndex: number | null;
  canGoBack: boolean;
  onBack: () => void;
  onSelect: (choiceIndex: number) => void;
};

export function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  currentChoiceIndex,
  selectedChoiceIndex,
  canGoBack,
  onBack,
  onSelect,
}: QuestionScreenProps) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <section className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            {canGoBack ? (
              <button type="button" onClick={onBack} className="text-link">
                ← 前の質問
              </button>
            ) : (
              <div className="h-[20px]" />
            )}
          </div>
          <div className="tag">
            直感で選んでOK
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[rgba(59,130,246,0.12)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#3B82F6,#60A5FA)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-bold tracking-[0.12em] text-[var(--color-text-sub)]">
          Q{questionIndex + 1} / {totalQuestions}
        </p>

        <div key={question.id} className="question-slide mt-7">
          <div className="card rounded-[16px] p-6 sm:p-8">
            <h2 className="text-left text-2xl font-black leading-relaxed text-[var(--text-main)] sm:text-3xl">
              {question.question}
            </h2>

            <div className="mt-8 grid gap-3">
              {question.choices.map((choice, choiceIndex) => {
                const isSelected = selectedChoiceIndex === choiceIndex;
                const isCurrent = currentChoiceIndex === choiceIndex;
                const isDisabled = selectedChoiceIndex !== null;

                return (
                  <button
                    key={choice.text}
                    type="button"
                    onClick={() => onSelect(choiceIndex)}
                    disabled={isDisabled}
                    className={`choice-button group rounded-[1.4rem] border px-5 py-5 text-left text-sm font-medium leading-7 transition duration-200 sm:px-6 sm:text-base ${
                      isSelected
                        ? "border-[rgba(232,69,60,0.4)] bg-[var(--color-main)] text-white"
                        : isCurrent
                          ? "border-[rgba(232,69,60,0.3)] bg-[rgba(232,69,60,0.06)] text-[var(--text-main)]"
                          : "border-[color:var(--line)] bg-white text-[var(--text-main)] hover:border-[rgba(232,69,60,0.28)]"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
