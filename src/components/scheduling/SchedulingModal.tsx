"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { guessTimezone, isSameDay, type TimeOfDay } from "@/lib/utils/calendar";
import { requestMeeting, type MeetingResult } from "@/lib/api/scheduling";
import { SchedulingSidebar } from "@/components/scheduling/SchedulingSidebar";
import { CalendarStep } from "@/components/scheduling/CalendarStep";
import {
  DetailsStep,
  buildAdditionalAttendees,
  buildMeetingMessage,
  isBookingFormValid,
  type BookingFormState,
} from "@/components/scheduling/DetailsStep";
import { ResultStep } from "@/components/scheduling/ResultStep";

type Step = "calendar" | "details" | "result";

const EMPTY_FORM: BookingFormState = {
  name: "",
  email: "",
  topic: "",
  notes: "",
  additionalAttendees: "",
};

const STEP_MAX_WIDTH: Record<Step, string> = {
  calendar: "sm:max-w-3xl",
  details: "sm:max-w-3xl",
  result: "sm:max-w-md",
};

interface SchedulingModalProps {
  open: boolean;
  onClose: () => void;
  candidateFirstName: string;
  /** From useChatSession — the meetings endpoint is tied to this chat session, not the slug directly. */
  sessionId: string | null;
  /** Fallback shown once the candidate's calendar turns out not to be connected (a 409). */
  contactEmail: string | null;
  /** A meeting was successfully booked — the parent pins the link at the top of the chat. */
  onBooked: (meeting: MeetingResult) => void;
  /** The candidate's calendar isn't connected (409) — the parent hides the scheduling action for the rest of the session. */
  onUnavailable: () => void;
}

export function SchedulingModal({
  open,
  onClose,
  candidateFirstName,
  sessionId,
  contactEmail,
  onBooked,
  onUnavailable,
}: SchedulingModalProps) {
  const [step, setStep] = useState<Step>("calendar");

  const [today] = useState(() => new Date());
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [durationMinutes, setDurationMinutes] = useState<30 | 60>(30);
  const [use24h, setUse24h] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay | null>(null);
  const [timezone] = useState(guessTimezone);
  const [requestId, setRequestId] = useState<string | null>(null);

  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [resultKind, setResultKind] = useState<"success" | "error">("success");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canRetryResult, setCanRetryResult] = useState(true);
  const [meetingResult, setMeetingResult] = useState<MeetingResult | null>(null);

  const close = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep("calendar");
      setSelectedDate(null);
      setSelectedTime(null);
      setRequestId(null);
      setForm(EMPTY_FORM);
      setErrorMessage(null);
      setMeetingResult(null);
      setSubmitting(false);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }, 200);
  }, [onClose, today]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  function navigateMonth(direction: -1 | 1) {
    const next = new Date(viewYear, viewMonth + direction, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function selectDate(date: Date) {
    if (selectedDate && isSameDay(date, selectedDate)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  }

  // Picking a time is the only decision left on this step, so it advances
  // straight to the details form — a separate "Continue" click would just
  // repeat the choice the recruiter already made. The one explicit
  // confirmation the flow asks for is "Send Meet invite" on the details step.
  // A fresh request_id marks this as a new booking attempt — kept stable
  // through retries of the same attempt (see handleSubmit).
  function selectTime(time: TimeOfDay) {
    setSelectedTime(time);
    setRequestId(crypto.randomUUID());
    setStep("details");
  }

  async function handleSubmit() {
    if (!sessionId || !selectedDate || !selectedTime || !requestId || !isBookingFormValid(form)) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const startDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.hour,
        selectedTime.minute,
        0,
        0
      );

      const outcome = await requestMeeting(sessionId, {
        attendeeEmail: form.email.trim(),
        attendeeName: form.name.trim(),
        start: startDateTime.toISOString(),
        durationMinutes,
        timezone,
        message: buildMeetingMessage(form),
        additionalAttendees: buildAdditionalAttendees(form),
        requestId,
      });

      switch (outcome.kind) {
        case "ok":
          setMeetingResult(outcome.meeting);
          setResultKind("success");
          setCanRetryResult(true);
          onBooked(outcome.meeting);
          break;
        case "unavailable-permanently":
          onUnavailable();
          setResultKind("error");
          setCanRetryResult(false);
          setErrorMessage(
            contactEmail
              ? `${candidateFirstName} isn't taking meeting requests here right now — you can still reach out directly at ${contactEmail}.`
              : `${candidateFirstName} isn't taking meeting requests here right now.`
          );
          break;
        case "session-expired":
          setResultKind("error");
          setCanRetryResult(false);
          setErrorMessage("This chat session has expired — refresh the page to start a new one.");
          break;
        case "validation-error":
          setResultKind("error");
          setCanRetryResult(true);
          setErrorMessage(outcome.detail || "Please double-check the date, time, and email, then try again.");
          break;
        case "rate-limited":
          setResultKind("error");
          setCanRetryResult(true);
          setErrorMessage("Too many requests right now — please try again in a little while.");
          break;
        case "service-unavailable":
          setResultKind("error");
          setCanRetryResult(true);
          setErrorMessage(
            contactEmail
              ? `Scheduling is temporarily unavailable — you can reach out directly at ${contactEmail}.`
              : "Scheduling is temporarily unavailable right now — please try again shortly."
          );
          break;
      }
    } catch {
      setResultKind("error");
      setCanRetryResult(true);
      setErrorMessage("Something went wrong sending that request. Please try again.");
    } finally {
      setSubmitting(false);
      setStep("result");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={close}
        className="absolute inset-0 animate-slide-in bg-black/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Schedule a Google Meet"
        className={cn(
          "relative z-10 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated animate-modal-in md:flex-row",
          STEP_MAX_WIDTH[step]
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close scheduling"
          className="absolute top-4 right-4 z-10 text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {step !== "result" && (
          <SchedulingSidebar
            candidateFirstName={candidateFirstName}
            durationMinutes={durationMinutes}
            onDurationChange={step === "calendar" ? setDurationMinutes : undefined}
            selectedDate={step === "details" ? selectedDate : undefined}
            selectedTime={step === "details" ? selectedTime : undefined}
            timezone={timezone}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {step === "calendar" && (
            <CalendarStep
              today={today}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onNavigateMonth={navigateMonth}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              durationMinutes={durationMinutes}
              use24h={use24h}
              onToggle24h={setUse24h}
              selectedTime={selectedTime}
              onSelectTime={selectTime}
            />
          )}

          {step === "details" && (
            <DetailsStep
              candidateFirstName={candidateFirstName}
              form={form}
              onChange={setForm}
              onBack={() => setStep("calendar")}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}

          {step === "result" && selectedDate && selectedTime && (
            <ResultStep
              kind={resultKind}
              date={selectedDate}
              time={selectedTime}
              durationMinutes={durationMinutes}
              email={form.email}
              meeting={meetingResult}
              errorMessage={errorMessage ?? undefined}
              canRetry={canRetryResult}
              onDone={close}
              onRetry={() => setStep("details")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
