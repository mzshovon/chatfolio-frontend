"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CandidateBar, CandidateHero } from "@/components/candidate/CandidateHero";
import { CandidateProfile } from "@/components/candidate/CandidateProfile";
import { ChatInput } from "@/components/chat/ChatInput";
import { ErrorBanner } from "@/components/chat/ErrorBanner";
import { MeetingBookedBanner } from "@/components/chat/MeetingBookedBanner";
import { MessageList } from "@/components/chat/MessageList";
import { useIntroPrompt, useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { RecruiterHeader } from "@/components/layout/RecruiterHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SchedulingModal } from "@/components/scheduling/SchedulingModal";
import { Avatar } from "@/components/ui/Avatar";
import { useChatSession } from "@/hooks/useChatSession";
import { firstNameFor, initials } from "@/lib/utils/date";
import type { MeetingResult } from "@/lib/api/scheduling";
import type { ChatfolioPage } from "@/lib/api/types";

const SUGGESTIONS = [
  "What's your experience?",
  "Tell me about a project you're proud of",
  "What are your key skills?",
  "Are you open to new roles?",
  "What kind of problems do you love solving?",
];

const SHEET_ANIMATION_MS = 340;
const HIGHLIGHT_DURATION_MS = 1800;
/** Questions an anonymous recruiter can ask before being asked to introduce themselves. */
const ANON_QUESTION_LIMIT = 10;

export function ChatWidget({ data }: { data: ChatfolioPage }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [meetingBooked, setMeetingBooked] = useState<MeetingResult | null>(null);
  // Once the candidate's calendar turns out not to be connected (a 409), the
  // doc says to hide the scheduling action for the rest of the session
  // rather than let a recruiter keep hitting the same error.
  const [meetingsUnavailable, setMeetingsUnavailable] = useState(false);
  const { ready, recruiter, openGate } = useRecruiter();
  const firstName = firstNameFor(data.full_name);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /** Scrolls the CV to a section and flashes it; on small screens the CV sheet opens first. */
  const jumpToSection = useCallback((sectionId: string) => {
    const inline = window.matchMedia("(min-width: 1024px)").matches;
    if (!inline) setProfileOpen(true);
    timers.current.push(
      setTimeout(
        () => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        inline ? 0 : SHEET_ANIMATION_MS
      )
    );
    setHighlightedId(sectionId);
    timers.current.push(setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS));
  }, []);

  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  // Booking needs an introduction; anonymous recruiters are asked first, then continue to the calendar.
  const openScheduling = useCallback(() => {
    if (recruiter) return setSchedulingOpen(true);
    openGate({ reason: "meet", candidateName: firstName, onDone: () => setSchedulingOpen(true) });
  }, [recruiter, openGate, firstName]);
  const closeScheduling = useCallback(() => setSchedulingOpen(false), []);
  const {
    sessionId,
    sessionStatus,
    messages,
    questionsAsked,
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

  useIntroPrompt(`chat:${data.slug}`, firstName);

  const anonQuestionsLeft = Math.max(0, ANON_QUESTION_LIMIT - questionsAsked);
  const ask = (text: string) => {
    if (!recruiter && questionsAsked >= ANON_QUESTION_LIMIT) {
      return openGate({ reason: "chat", candidateName: firstName, onDone: () => void send(text) });
    }
    void send(text);
  };

  const heroProps = { data, sessionId, meetingsUnavailable, onOpenScheduling: openScheduling };

  return (
    <div className="flex min-h-dvh flex-col">
      <RecruiterHeader />
      <CandidateHero {...heroProps} />
      <CandidateBar {...heroProps} onOpenProfile={openProfile} />

      {meetingBooked && <MeetingBookedBanner meeting={meetingBooked} />}

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 items-start gap-5 px-3 py-3 lg:px-6 lg:pt-5 lg:pb-10">
        <aside
          data-screen-label="Chat panel"
          className="shadow-elevated sticky top-[68px] flex h-[calc(100dvh-9.5rem)] min-h-[480px] min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-border bg-surface lg:h-[calc(100dvh-5.5rem)] lg:flex-[1.35]"
        >
          <div className="flex items-center gap-2.5 border-b border-border-subtle px-4 py-3.5">
            <Avatar
              label={initials(data.full_name)}
              imageUrl={data.avatar_url}
              size="sm"
              online
              ringClass="border-surface"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold text-text-primary">Ask {firstName}&apos;s AI</div>
              <div className="truncate text-xs text-text-muted">Replies in seconds · only from this profile</div>
            </div>
          </div>

          <MessageList
            data={data}
            messages={messages}
            isSending={isSending}
            suggestions={SUGGESTIONS}
            onPickSuggestion={ask}
            onOpenSection={jumpToSection}
            inputDisabled={inputDisabled}
            sessionId={sessionId}
            meetingsUnavailable={meetingsUnavailable}
            onOpenScheduling={openScheduling}
          />

          {sessionStatus === "connecting" && messages.length === 0 && (
            <div className="px-6 pb-2 text-center text-xs text-text-secondary">Connecting to chat…</div>
          )}

          {banner && <ErrorBanner banner={banner} onRestart={restart} />}

          {ready && !recruiter && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-warn-bg px-3.5 py-2 text-[12.5px] text-warn-text">
              <span className="min-w-[160px] flex-1">
                Chatting anonymously · {anonQuestionsLeft} of {ANON_QUESTION_LIMIT} questions left
              </span>
              <button
                type="button"
                onClick={() => openGate({ reason: "edit", candidateName: firstName })}
                className="font-bold underline-offset-2 hover:underline"
              >
                Introduce yourself →
              </button>
            </div>
          )}

          <ChatInput
            draft={draft}
            onDraftChange={setDraft}
            onSend={() => ask(draft)}
            disabled={inputDisabled}
            isSending={isSending}
            cooldownSecondsLeft={cooldownSecondsLeft}
            maxLength={maxMessageLength}
            placeholder={`Ask ${firstName}'s AI anything…`}
          />
        </aside>

        <CandidateProfile
          data={data}
          open={profileOpen}
          onClose={closeProfile}
          onJump={jumpToSection}
          highlightedId={highlightedId}
          onAsk={ask}
        />
      </div>

      <SiteFooter />

      <SchedulingModal
        open={schedulingOpen}
        onClose={closeScheduling}
        candidateFirstName={firstName}
        sessionId={sessionId}
        contactEmail={data.contact_email}
        onBooked={setMeetingBooked}
        onUnavailable={() => setMeetingsUnavailable(true)}
        prefill={recruiter ? { name: recruiter.name, notes: `${recruiter.title}, ${recruiter.org}` } : null}
      />
    </div>
  );
}
