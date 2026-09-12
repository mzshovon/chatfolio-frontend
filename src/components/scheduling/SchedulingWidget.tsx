"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { guessTimezone, isSameDay, type TimeOfDay } from "@/lib/utils/calendar";
import { submitBooking } from "@/lib/api/scheduling";
import { SchedulingSidebar } from "@/components/scheduling/SchedulingSidebar";
import { CalendarStep } from "@/components/scheduling/CalendarStep";
import { DetailsStep, isBookingFormValid, type BookingFormState } from "@/components/scheduling/DetailsStep";
import { ResultStep } from "@/components/scheduling/ResultStep";

type Step = "calendar" | "details" | "result";

const EMPTY_FORM: BookingFormState = { name: "", email: "", topic: "", notes: "", guestEmails: [] };

const STEP_MAX_WIDTH: Record<Step, string> = {
  calendar: "sm:max-w-3xl",
  details: "sm:max-w-3xl",
  result: "sm:max-w-md",
};

export function SchedulingWidget({ candidateFirstName }: { candidateFirstName: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("calendar");

  const [today] = useState(() => new Date());
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [durationMinutes, setDurationMinutes] = useState<30 | 60>(30);
  const [use24h, setUse24h] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay | null>(null);
  const [timezone] = useState(guessTimezone);

  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [resultKind, setResultKind] = useState<"success" | "error">("success");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setStep("calendar");
      setSelectedDate(null);
      setSelectedTime(null);
      setForm(EMPTY_FORM);
      setErrorMessage(null);
      setSubmitting(false);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }, 200);
  }, [today]);

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
  // confirmation the flow asks for is "Confirm" on the details step.
  function selectTime(time: TimeOfDay) {
    setSelectedTime(time);
    setStep("details");
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedTime || !isBookingFormValid(form)) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const outcome = await submitBooking({
        date: selectedDate.toISOString().slice(0, 10),
        startTime: `${String(selectedTime.hour).padStart(2, "0")}:${String(selectedTime.minute).padStart(2, "0")}`,
        durationMinutes,
        timezone,
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic.trim(),
        notes: form.notes.trim() || undefined,
        guestEmails: form.guestEmails.map((g) => g.trim()).filter(Boolean),
      });

      if (outcome.kind === "ok") {
        setResultKind("success");
      } else {
        setResultKind("error");
        setErrorMessage(outcome.detail || null);
      }
    } catch {
      setResultKind("error");
      setErrorMessage(null);
    } finally {
      setSubmitting(false);
      setStep("result");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Schedule a call"
        className="shadow-soft flex items-center gap-1.5 rounded-[9px] border border-border bg-surface px-3.5 py-[7px] text-[13px] font-medium text-text-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
      >
        <CalendarClock className="h-[13px] w-[13px] opacity-75" />
        <span className="hidden sm:inline">Schedule a call</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={close}
            className="absolute inset-0 animate-slide-in bg-black/40 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Schedule a call"
            className={cn(
              "relative z-10 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated animate-modal-in sm:flex-row",
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
                  errorMessage={errorMessage ?? undefined}
                  onDone={close}
                  onRetry={() => setStep("details")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
