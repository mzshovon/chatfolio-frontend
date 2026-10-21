import { BookOpen } from "lucide-react";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { MeetingRequestPrompt } from "@/components/chat/MeetingRequestPrompt";
import { INTENT_SECTIONS } from "@/components/chat/intentSections";
import type { ChatMessage } from "@/lib/api/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenSection: (sectionId: string) => void;
  candidateFirstName: string;
  contactEmail: string | null;
  sessionId: string | null;
  meetingsUnavailable: boolean;
  onOpenScheduling: () => void;
}

export function MessageBubble({
  message,
  onOpenSection,
  candidateFirstName,
  contactEmail,
  sessionId,
  meetingsUnavailable,
  onOpenScheduling,
}: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="animate-slide-in max-w-[85%] self-end rounded-2xl rounded-br-[4px] bg-user-bubble px-3.5 py-2.5 text-user-bubble-text">
        <p className="text-sm leading-normal whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  const intentEntry = message.intent ? INTENT_SECTIONS[message.intent] : null;

  return (
    <div className="animate-slide-in flex max-w-[92%] flex-col gap-1.5 self-start">
      <div className="rounded-2xl rounded-bl-[4px] bg-asst-bubble px-3.5 py-2.5 text-text-primary">
        <MarkdownContent content={message.content} />
      </div>
      {intentEntry && (
        <button
          type="button"
          onClick={() => onOpenSection(intentEntry.sectionId)}
          title="Show in CV"
          className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-[3px] text-[11.5px] font-semibold text-accent-hover transition-colors hover:border-accent dark:text-accent"
        >
          <BookOpen className="h-3 w-3" />
          {intentEntry.label}
        </button>
      )}
      {message.intent === "meeting_request" && (
        <MeetingRequestPrompt
          candidateFirstName={candidateFirstName}
          sessionId={sessionId}
          contactEmail={contactEmail}
          meetingsUnavailable={meetingsUnavailable}
          onOpenScheduling={onOpenScheduling}
        />
      )}
    </div>
  );
}
