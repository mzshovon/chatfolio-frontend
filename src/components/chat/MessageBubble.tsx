import { Avatar } from "@/components/ui/Avatar";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/date";
import type { ChatMessage } from "@/lib/api/types";

interface MessageBubbleProps {
  message: ChatMessage;
  assistantName: string;
}

export function MessageBubble({ message, assistantName }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
      </div>
    </div>
  );
}
