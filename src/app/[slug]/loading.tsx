export default function ChatfolioLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-36 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-6 w-11 animate-pulse rounded-full bg-surface-2" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <span className="text-sm">Loading chatfolio…</span>
        </div>
      </div>
    </div>
  );
}
