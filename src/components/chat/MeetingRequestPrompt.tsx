import { CalendarClock } from "lucide-react";

interface MeetingRequestPromptProps {
  candidateFirstName: string;
  sessionId: string | null;
  contactEmail: string | null;
  meetingsUnavailable: boolean;
  onOpenScheduling: () => void;
}

/**
 * Rendered inline, right under an assistant reply classified as
 * `meeting_request` — so a recruiter who just typed "can we hop on a call?"
 * sees a concrete next step immediately, instead of having to notice the
 * small header button on their own.
 */
export function MeetingRequestPrompt({
  candidateFirstName,
  sessionId,
  contactEmail,
  meetingsUnavailable,
  onOpenScheduling,
}: MeetingRequestPromptProps) {
  if (meetingsUnavailable) {
    return contactEmail ? (
      <p className="mt-2 text-xs text-text-muted">
        Scheduling isn&apos;t available here right now — you can reach {candidateFirstName} at{" "}
        <a href={`mailto:${contactEmail}`} className="underline hover:text-text-secondary">
          {contactEmail}
        </a>
        .
      </p>
    ) : null;
  }

  return (
    <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-3">
      <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">Want to grab time on the calendar?</p>
        <p className="text-xs text-text-secondary">Pick a day and time — it only takes a minute.</p>
      </div>
      <button
        type="button"
        onClick={() => sessionId && onOpenScheduling()}
        disabled={!sessionId}
        className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sessionId ? "Pick a time" : "Connecting…"}
      </button>
    </div>
  );
}
