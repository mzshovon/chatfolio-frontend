import { PanelRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { initials } from "@/lib/utils/date";

interface ChatHeaderProps {
  fullName: string;
  title: string | null;
  location: string | null;
  onTogglePortfolio: () => void;
}

export function ChatHeader({ fullName, title, location, onTogglePortfolio }: ChatHeaderProps) {
  const subtitle = [title, location].filter(Boolean).join(" · ");

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar label={initials(fullName)} />
        <div className="min-w-0">
          <div className="truncate text-[15px] leading-tight font-semibold text-text-primary">
            Chat with {fullName}
          </div>
          {subtitle && (
            <div className="truncate text-xs leading-tight text-text-secondary">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onTogglePortfolio}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-2"
        >
          <PanelRight className="h-4 w-4" />
          <span className="hidden sm:inline">Portfolio</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
