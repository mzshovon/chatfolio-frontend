"use client";

import { useCallback, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ErrorBanner } from "@/components/chat/ErrorBanner";
import { MeetingBookedBanner } from "@/components/chat/MeetingBookedBanner";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { SchedulingModal } from "@/components/scheduling/SchedulingModal";
import { useChatSession } from "@/hooks/useChatSession";
import { firstNameFor } from "@/lib/utils/date";
import type { MeetingResult } from "@/lib/api/scheduling";
import type { ChatfolioPage } from "@/lib/api/types";

const SUGGESTIONS = [
  "What's your experience?",
  "Tell me about a project you're proud of",
  "What are your key skills?",
  "Are you open to new roles?",
  "What kind of problems do you love solving?",
];

export function ChatWidget({ data }: { data: ChatfolioPage }) {
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [scrollToSectionId, setScrollToSectionId] = useState<string | null>(null);
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [meetingBooked, setMeetingBooked] = useState<MeetingResult | null>(null);
  // Once the candidate's calendar turns out not to be connected (a 409), the
  // doc says to hide the scheduling action for the rest of the session
  // rather than let a recruiter keep hitting the same error.
  const [meetingsUnavailable, setMeetingsUnavailable] = useState(false);

  const focusPortfolioSection = useCallback((sectionId: string) => {
    setPortfolioOpen(true);
    setScrollToSectionId(sectionId);
  }, []);
  const closePortfolio = useCallback(() => setPortfolioOpen(false), []);
  const togglePortfolio = useCallback(() => setPortfolioOpen((v) => !v), []);
  const clearScrollTarget = useCallback(() => setScrollToSectionId(null), []);
  const openScheduling = useCallback(() => setSchedulingOpen(true), []);
  const closeScheduling = useCallback(() => setSchedulingOpen(false), []);
  const {
    sessionId,
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

  const firstName = firstNameFor(data.full_name);

  return (
    <div className="flex h-dvh flex-col">
      <ChatHeader
        fullName={data.full_name}
        title={data.title}
        location={data.location}
        avatarUrl={data.avatar_url}
        onTogglePortfolio={togglePortfolio}
        sessionId={sessionId}
        contactEmail={data.contact_email}
        meetingsUnavailable={meetingsUnavailable}
        onOpenScheduling={openScheduling}
      />

      {meetingBooked && <MeetingBookedBanner meeting={meetingBooked} />}

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <MessageList
            data={data}
            messages={messages}
            assistantName={data.full_name}
            isSending={isSending}
            suggestions={SUGGESTIONS}
            onPickSuggestion={(text) => void send(text)}
            onOpenSection={focusPortfolioSection}
            inputDisabled={inputDisabled}
            sessionId={sessionId}
            meetingsUnavailable={meetingsUnavailable}
            onOpenScheduling={openScheduling}
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

      <SchedulingModal
        open={schedulingOpen}
        onClose={closeScheduling}
        candidateFirstName={firstName}
        sessionId={sessionId}
        contactEmail={data.contact_email}
        onBooked={setMeetingBooked}
        onUnavailable={() => setMeetingsUnavailable(true)}
      />
    </div>
  );
}
