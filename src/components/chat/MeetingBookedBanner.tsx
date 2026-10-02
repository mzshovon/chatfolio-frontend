import { Video } from "lucide-react";
import type { MeetingResult } from "@/lib/api/scheduling";

/**
 * Pinned at the top of the chat for the rest of the session once a Meet is
 * booked — the one place the link lives once it's been handed off, rather
 * than being buried back in the scheduling modal's confirmation screen.
 */
export function MeetingBookedBanner({ meeting }: { meeting: MeetingResult }) {
  const start = new Date(meeting.start);
  const timeLabel = Number.isNaN(start.getTime())
    ? null
    : start.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-subtle bg-live-subtle px-4 py-2 text-sm sm:px-6">
      <span className="inline-flex items-center gap-1.5 font-medium text-live">
        <Video className="h-4 w-4 shrink-0" />
        Meet booked{timeLabel ? ` · ${timeLabel}` : ""}
      </span>
      {meeting.meet_link ? (
        <a
          href={meeting.meet_link}
          target="_blank"
          rel="noreferrer"
          className="truncate text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
        >
          {meeting.meet_link.replace("https://", "")}
        </a>
      ) : (
        <span className="text-xs text-text-muted">Link emailed shortly — Google is still generating it.</span>
      )}
    </div>
  );
}
