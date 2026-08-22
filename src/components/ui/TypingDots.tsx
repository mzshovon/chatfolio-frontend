export function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-text-secondary" />
      <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-text-secondary [animation-delay:0.15s]" />
      <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-text-secondary [animation-delay:0.3s]" />
    </div>
  );
}
