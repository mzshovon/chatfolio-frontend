import { cn } from "@/lib/utils/cn";
import type { ChatBanner } from "@/hooks/useChatSession";

interface ErrorBannerProps {
  banner: ChatBanner;
  onRestart: () => void;
}

export function ErrorBanner({ banner, onRestart }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 px-5 py-2.5 text-sm",
        banner.tone === "warn"
          ? "bg-warn-bg text-warn-text"
          : "bg-error-bg text-error-text"
      )}
    >
      <span>{banner.text}</span>
      {banner.restartLabel && (
        <button
          type="button"
          onClick={onRestart}
          className="ml-auto shrink-0 cursor-pointer bg-transparent text-sm font-semibold underline"
        >
          {banner.restartLabel}
        </button>
      )}
    </div>
  );
}
