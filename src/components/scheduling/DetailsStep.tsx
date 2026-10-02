import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BookingFormState {
  name: string;
  email: string;
  topic: string;
  notes: string;
  /** Raw comma-separated input — see `buildAdditionalAttendees` for the cleaned form sent to the API. */
  additionalAttendees: string;
}

const TOPIC_MAX_LENGTH = 120;
const NOTES_MAX_LENGTH = 280;

interface DetailsStepProps {
  candidateFirstName: string;
  form: BookingFormState;
  onChange: (form: BookingFormState) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function splitEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function isBookingFormValid(form: BookingFormState): boolean {
  if (!form.name.trim() || !form.topic.trim()) return false;
  if (!EMAIL_PATTERN.test(form.email.trim())) return false;
  return splitEmails(form.additionalAttendees).every((e) => EMAIL_PATTERN.test(e));
}

/** Sent as the API's `message` field — just the meeting context, guests go in `additional_attendees`. */
export function buildMeetingMessage(form: BookingFormState): string {
  const parts = [form.topic.trim()];
  if (form.notes.trim()) parts.push(form.notes.trim());
  return parts.join("\n\n").slice(0, 500);
}

/** Sent as the API's `additional_attendees` field — a cleaned, comma-separated string, or undefined if empty. */
export function buildAdditionalAttendees(form: BookingFormState): string | undefined {
  const emails = splitEmails(form.additionalAttendees);
  return emails.length > 0 ? emails.join(",") : undefined;
}

export function DetailsStep({
  candidateFirstName,
  form,
  onChange,
  onBack,
  onSubmit,
  submitting,
}: DetailsStepProps) {
  const canSubmit = isBookingFormValid(form) && !submitting;

  function set<K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-1 flex-col gap-4 px-5 py-5 sm:py-6 sm:pl-6 sm:pr-10 lg:pr-16"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-name" className="text-sm font-medium text-text-primary">
          Your name <span className="text-accent">*</span>
        </label>
        <input
          id="booking-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Doe"
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-email" className="text-sm font-medium text-text-primary">
          Your email <span className="text-accent">*</span>
        </label>
        <input
          id="booking-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@company.com"
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
        <p className="text-xs text-text-muted">The Google Meet invite goes here.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-topic" className="text-sm font-medium text-text-primary">
          What would you like to chat about? <span className="text-accent">*</span>
        </label>
        <input
          id="booking-topic"
          value={form.topic}
          onChange={(e) => set("topic", e.target.value.slice(0, TOPIC_MAX_LENGTH))}
          maxLength={TOPIC_MAX_LENGTH}
          placeholder={`e.g. The Backend Engineer role with ${candidateFirstName}`}
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-notes" className="text-sm font-medium text-text-primary">
          Anything else {candidateFirstName} should know?
        </label>
        <textarea
          id="booking-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value.slice(0, NOTES_MAX_LENGTH))}
          maxLength={NOTES_MAX_LENGTH}
          rows={3}
          placeholder="Optional — a bit of context goes a long way."
          className="resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
        <span className="self-end text-xs text-text-muted">
          {form.notes.length}/{NOTES_MAX_LENGTH}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-guests" className="text-sm font-medium text-text-primary">
          Loop in other recruiters
        </label>
        <input
          id="booking-guests"
          value={form.additionalAttendees}
          onChange={(e) => set("additionalAttendees", e.target.value)}
          placeholder="sam@company.com, alex@company.com"
          aria-describedby="booking-guests-hint"
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
        <p id="booking-guests-hint" className="text-xs text-text-muted">
          Optional — separate multiple emails with commas. They&apos;ll be added as guests on the
          Google Meet invite.
        </p>
      </div>

      <p className="text-xs text-text-muted">
        We&apos;ll create a Google Meet and email the invite to the address above.
      </p>

      <div className="mt-1 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover",
            !canSubmit && "cursor-not-allowed bg-border text-text-secondary hover:bg-border"
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Sending invite…" : "Send Meet invite"}
        </button>
      </div>
    </form>
  );
}
