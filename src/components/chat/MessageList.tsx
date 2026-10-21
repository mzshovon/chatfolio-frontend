"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { TypingDots } from "@/components/ui/TypingDots";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { firstNameFor } from "@/lib/utils/date";
import type { ChatfolioPage, ChatMessage } from "@/lib/api/types";

interface MessageListProps {
  data: ChatfolioPage;
  messages: ChatMessage[];
  isSending: boolean;
  suggestions: string[];
  onPickSuggestion: (text: string) => void;
  onOpenSection: (sectionId: string) => void;
  inputDisabled: boolean;
  sessionId: string | null;
  meetingsUnavailable: boolean;
  onOpenScheduling: () => void;
}

export function MessageList({
  data,
  messages,
  isSending,
  suggestions,
  onPickSuggestion,
  onOpenSection,
  inputDisabled,
  sessionId,
  meetingsUnavailable,
  onOpenScheduling,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const firstName = firstNameFor(data.full_name);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  return (
    <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-bg p-4">
      <div className="max-w-[92%] self-start rounded-2xl rounded-bl-[4px] bg-asst-bubble px-3.5 py-2.5 text-sm leading-relaxed text-text-primary">
        Hi, I&apos;m {firstName}&apos;s AI. Ask me about their experience, projects or skills. Tap any
        &ldquo;Ask about this&rdquo; in the CV too.
      </div>

      {messages.length === 0 && (
        <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-1.5">
          {suggestions.map((text) => (
            <button
              key={text}
              type="button"
              disabled={inputDisabled}
              onClick={() => onPickSuggestion(text)}
              className="flex items-center justify-between gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-[13.5px] font-medium text-text-primary transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {text}
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent" />
            </button>
          ))}
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onOpenSection={onOpenSection}
          candidateFirstName={firstName}
          contactEmail={data.contact_email}
          sessionId={sessionId}
          meetingsUnavailable={meetingsUnavailable}
          onOpenScheduling={onOpenScheduling}
        />
      ))}

      {isSending && (
        <div className="animate-slide-in self-start rounded-2xl rounded-bl-[4px] bg-asst-bubble px-4 py-3.5">
          <TypingDots />
        </div>
      )}
    </div>
  );
}
