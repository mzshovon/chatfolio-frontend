import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatFullDate, formatTimeRange, type TimeOfDay } from "@/lib/utils/calendar";
import type { MeetingResult } from "@/lib/api/scheduling";

interface ResultStepProps {
  kind: "success" | "error";
  date: Date;
  time: TimeOfDay;
  durationMinutes: 30 | 60;
  email: string;
  meeting?: MeetingResult | null;
  errorMessage?: string;
  canRetry?: boolean;
  onDone: () => void;
  onRetry: () => void;
}

export function ResultStep({
  kind,
  date,
  time,
  durationMinutes,
  email,
  meeting,
  errorMessage,
  canRetry = true,
  onDone,
  onRetry,
}: ResultStepProps) {
  const isSuccess = kind === "success";

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-6 py-10 text-center sm:py-14">
      <div
        className={
          isSuccess
            ? "flex h-12 w-12 items-center justify-center rounded-full bg-live-subtle text-live"
            : "flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error-text"
        }
      >
        {isSuccess ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-text-primary">
          {isSuccess ? "You're all set! 🎉" : "That didn't go through"}
        </h3>
        <p className="max-w-sm text-sm text-text-secondary">
          {isSuccess
            ? `A Google Meet is booked for ${formatFullDate(date)}, ${formatTimeRange(time, durationMinutes, false)}. We've emailed the invite to ${email}.`
            : errorMessage || "We couldn't send that request. Please try again."}
        </p>
        {isSuccess && (
          <p className="text-xs text-text-muted">
            {meeting?.meet_link
              ? "The link is also pinned at the top of this chat."
              : "Google is still generating the link — check your email and the top of this chat shortly."}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {isSuccess || !canRetry ? (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onDone}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
