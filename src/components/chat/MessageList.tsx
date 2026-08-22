"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { TypingDots } from "@/components/ui/TypingDots";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { WelcomeSuggestions } from "@/components/chat/WelcomeSuggestions";
import { initials } from "@/lib/utils/date";
import type { ChatMessage } from "@/lib/api/types";

interface MessageListProps {
  messages: ChatMessage[];
  assistantName: string;
  isSending: boolean;
  suggestions: string[];
  onPickSuggestion: (text: string) => void;
  onOpenSection: (sectionId: string) => void;
  inputDisabled: boolean;
}

export function MessageList({
  messages,
  assistantName,
  isSending,
  suggestions,
  onPickSuggestion,
  onOpenSection,
  inputDisabled,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  return (
    <div ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6">
      {messages.length === 0 && (
        <WelcomeSuggestions
          firstName={assistantName.split(" ")[0] || assistantName}
          suggestions={suggestions}
          onPick={onPickSuggestion}
          disabled={inputDisabled}
        />
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          assistantName={assistantName}
          onOpenSection={onOpenSection}
        />
      ))}

      {isSending && (
        <div className="flex animate-slide-in items-end gap-2 self-start">
          <Avatar size="sm" variant="accent" label={initials(assistantName)} />
          <div className="rounded-2xl bg-asst-bubble px-4 py-2.5">
            <TypingDots />
          </div>
        </div>
      )}
    </div>
  );
}
