"use client";

import { useCallback, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ErrorBanner } from "@/components/chat/ErrorBanner";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { useChatSession } from "@/hooks/useChatSession";
import type { ChatfolioPage } from "@/lib/api/types";

const SUGGESTIONS = [
  "What's your experience?",
  "Tell me about a project you're proud of",
  "What are your key skills?",
  "Are you open to new roles?",
];

export function ChatWidget({ data }: { data: ChatfolioPage }) {
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [scrollToSectionId, setScrollToSectionId] = useState<string | null>(null);

  const focusPortfolioSection = useCallback((sectionId: string) => {
    setPortfolioOpen(true);
    setScrollToSectionId(sectionId);
  }, []);
  const closePortfolio = useCallback(() => setPortfolioOpen(false), []);
  const togglePortfolio = useCallback(() => setPortfolioOpen((v) => !v), []);
  const clearScrollTarget = useCallback(() => setScrollToSectionId(null), []);
  const {
    sessionStatus,
    messages,
    draft,
    setDraft,
    isSending,
    cooldownSecondsLeft,
    inputDisabled,
    banner,
    send,
    restart,
    maxMessageLength,
  } = useChatSession(data.slug);

  const firstName = data.full_name.split(" ")[0] || data.full_name;

  return (
    <div className="flex min-h-screen flex-col">
      <ChatHeader
        fullName={data.full_name}
        title={data.title}
        location={data.location}
        onTogglePortfolio={togglePortfolio}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <MessageList
            messages={messages}
            assistantName={data.full_name}
            isSending={isSending}
            suggestions={SUGGESTIONS}
            onPickSuggestion={(text) => void send(text)}
            onOpenSection={focusPortfolioSection}
            inputDisabled={inputDisabled}
          />

          {sessionStatus === "connecting" && messages.length === 0 && (
            <div className="px-6 pb-2 text-center text-xs text-text-secondary">
              Connecting to chat…
            </div>
          )}

          {banner && <ErrorBanner banner={banner} onRestart={restart} />}

          <ChatInput
            draft={draft}
            onDraftChange={setDraft}
            onSend={() => void send(draft)}
            disabled={inputDisabled}
            isSending={isSending}
            cooldownSecondsLeft={cooldownSecondsLeft}
            maxLength={maxMessageLength}
            placeholder={`Message ${firstName}'s AI…`}
          />
        </div>

        <PortfolioPanel
          data={data}
          open={portfolioOpen}
          onClose={closePortfolio}
          scrollToSectionId={scrollToSectionId}
          onScrolledToSection={clearScrollTarget}
        />
      </div>
    </div>
  );
}
