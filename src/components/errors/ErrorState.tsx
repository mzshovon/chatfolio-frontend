import type { ReactNode } from "react";
import { AlertTriangle, Clock, RadioTower, SearchX, TimerReset } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ErrorStateIcon = "not-found" | "unavailable" | "rate-limit" | "session-expired" | "warning";

const icons: Record<ErrorStateIcon, typeof SearchX> = {
  "not-found": SearchX,
  unavailable: RadioTower,
  "rate-limit": Clock,
  "session-expired": TimerReset,
  warning: AlertTriangle,
};

interface ErrorStateProps {
  icon?: ErrorStateIcon;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  icon = "warning",
  title,
  message,
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 text-center",
        compact ? "gap-3 py-8" : "py-16",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-text-secondary">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className={cn("font-semibold text-text-primary", compact ? "text-base" : "text-xl")}>
          {title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">{message}</p>
      </div>
      {action}
    </div>
  );
}
