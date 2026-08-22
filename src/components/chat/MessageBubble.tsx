import { Avatar } from "@/components/ui/Avatar";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { INTENT_SECTIONS } from "@/components/chat/intentSections";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/date";
import type { ChatMessage } from "@/lib/api/types";

interface MessageBubbleProps {
  message: ChatMessage;
  assistantName: string;
  onOpenSection?: (sectionId: string) => void;
}

export function MessageBubble({ message, assistantName, onOpenSection }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const intentEntry = !isUser && message.intent ? INTENT_SECTIONS[message.intent] : null;

  return (
    <div
      className={cn(
        "flex animate-slide-in items-end gap-2",
        isUser ? "flex-row-reverse self-end" : "flex-row self-start"
      )}
    >
      <Avatar
        size="sm"
        variant={isUser ? "muted" : "accent"}
        label={isUser ? "You" : initials(assistantName)}
      />
      <div
        className={cn(
          "w-fit max-w-[min(68%,480px)] rounded-2xl px-4 py-2.5 text-text-primary",
          isUser ? "bg-user-bubble" : "bg-asst-bubble"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}

        {intentEntry && (
          <button
            type="button"
            onClick={() => onOpenSection?.(intentEntry.sectionId)}
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-accent transition-colors hover:border-accent/40 hover:bg-accent-soft"
          >
            {intentEntry.label}
          </button>
        )}
      </div>
    </div>
  );
}
