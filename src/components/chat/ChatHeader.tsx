import { PanelRight } from "lucide-react";
import { LiveAvatar } from "@/components/chat/LiveAvatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { initials } from "@/lib/utils/date";

interface ChatHeaderProps {
  fullName: string;
  title: string | null;
  location: string | null;
  avatarUrl?: string | null;
  onTogglePortfolio: () => void;
}

export function ChatHeader({
  fullName,
  title,
  location,
  avatarUrl,
  onTogglePortfolio,
}: ChatHeaderProps) {
  const subtitle = [title, location].filter(Boolean).join(" · ");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border-subtle bg-bg px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <LiveAvatar label={initials(fullName)} imageUrl={avatarUrl} showRing />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] leading-tight font-semibold text-text-primary">
            Chat with {fullName}
          </div>
          {subtitle && (
            <div className="truncate text-[11.5px] leading-tight text-text-muted">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onTogglePortfolio}
          aria-label="View full portfolio"
          className="shadow-soft flex items-center gap-1.5 rounded-[9px] border border-border bg-surface px-3.5 py-[7px] text-[13px] font-medium text-text-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          <PanelRight className="h-[13px] w-[13px] opacity-75" />
          <span className="hidden sm:inline">View Portfolio</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
