interface WelcomeSuggestionsProps {
  firstName: string;
  suggestions: string[];
  onPick: (text: string) => void;
  disabled: boolean;
}

export function WelcomeSuggestions({
  firstName,
  suggestions,
  onPick,
  disabled,
}: WelcomeSuggestionsProps) {
  return (
    <div className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
        Ask me anything about {firstName}
      </h2>
      <p className="text-sm leading-relaxed text-text-secondary">
        I&apos;m an AI answering on {firstName}&apos;s behalf, grounded in their profile —
        experience, projects, and skills.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(text)}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] text-text-primary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
