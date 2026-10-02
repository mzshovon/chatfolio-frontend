"use client";

import { CalendarClock } from "lucide-react";

interface SchedulingTriggerButtonProps {
  candidateFirstName: string;
  sessionId: string | null;
  contactEmail: string | null;
  meetingsUnavailable: boolean;
  onOpen: () => void;
}

export function SchedulingTriggerButton({
  candidateFirstName,
  sessionId,
  contactEmail,
  meetingsUnavailable,
  onOpen,
}: SchedulingTriggerButtonProps) {
  if (meetingsUnavailable) {
    return contactEmail ? (
      <a
        href={`mailto:${contactEmail}`}
        className="hidden text-[13px] font-medium text-text-secondary underline-offset-2 transition-colors hover:text-text-primary hover:underline sm:inline"
      >
        Email {candidateFirstName} directly
      </a>
    ) : null;
  }

  return (
    <button
      type="button"
      onClick={() => sessionId && onOpen()}
      disabled={!sessionId}
      aria-label={sessionId ? "Schedule a Google Meet" : "Connecting to chat"}
      className="shadow-soft flex items-center gap-1.5 rounded-[9px] border border-border bg-surface px-3.5 py-[7px] text-[13px] font-medium text-text-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-surface disabled:hover:text-text-secondary"
    >
      <CalendarClock className="h-[13px] w-[13px] opacity-75" />
      <span className="hidden sm:inline">{sessionId ? "Schedule a Meet" : "Connecting…"}</span>
    </button>
  );
}
