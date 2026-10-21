"use client";

import { CalendarClock, Mail } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

interface SchedulingTriggerButtonProps {
  candidateFirstName: string;
  sessionId: string | null;
  contactEmail: string | null;
  meetingsUnavailable: boolean;
  onOpen: () => void;
  /** Short label for tight layouts such as the mobile candidate bar. */
  compact?: boolean;
}

export function SchedulingTriggerButton({
  candidateFirstName,
  sessionId,
  contactEmail,
  meetingsUnavailable,
  onOpen,
  compact = false,
}: SchedulingTriggerButtonProps) {
  if (meetingsUnavailable) {
    return contactEmail ? (
      <a href={`mailto:${contactEmail}`} className={buttonClasses("outline-dark", "px-4 py-2.5 text-[13px]")}>
        <Mail className="h-3.5 w-3.5" />
        {compact ? "Email" : `Email ${candidateFirstName}`}
      </a>
    ) : null;
  }

  return (
    <button
      type="button"
      onClick={() => sessionId && onOpen()}
      disabled={!sessionId}
      aria-label={sessionId ? "Schedule a Google Meet" : "Connecting to chat"}
      className={buttonClasses("primary", "px-[18px] py-3 text-sm")}
    >
      <CalendarClock className="h-4 w-4" />
      {!sessionId ? "Connecting…" : compact ? "Meet" : "Schedule a Meet"}
    </button>
  );
}
