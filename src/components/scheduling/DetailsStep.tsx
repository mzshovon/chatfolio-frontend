import { Loader2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BookingFormState {
  name: string;
  email: string;
  topic: string;
  notes: string;
  guestEmails: string[];
}

interface DetailsStepProps {
  form: BookingFormState;
  onChange: (form: BookingFormState) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isBookingFormValid(form: BookingFormState): boolean {
  if (!form.name.trim() || !form.topic.trim()) return false;
  if (!EMAIL_PATTERN.test(form.email.trim())) return false;
  return form.guestEmails.every((g) => g.trim() === "" || EMAIL_PATTERN.test(g.trim()));
}

export function DetailsStep({ form, onChange, onBack, onSubmit, submitting }: DetailsStepProps) {
  const canSubmit = isBookingFormValid(form) && !submitting;

  function set<K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  function updateGuest(index: number, value: string) {
    const next = [...form.guestEmails];
    next[index] = value;
    set("guestEmails", next);
  }

  function removeGuest(index: number) {
    set(
      "guestEmails",
      form.guestEmails.filter((_, i) => i !== index)
    );
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
          Email address <span className="text-accent">*</span>
        </label>
        <input
          id="booking-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@company.com"
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-topic" className="text-sm font-medium text-text-primary">
          What is this meeting about? <span className="text-accent">*</span>
        </label>
        <input
          id="booking-topic"
          value={form.topic}
          onChange={(e) => set("topic", e.target.value)}
          placeholder="e.g. Discuss the Backend Engineer role"
          className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-notes" className="text-sm font-medium text-text-primary">
          Additional notes
        </label>
        <textarea
          id="booking-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Please share anything that will help prepare for our meeting."
          className="resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-2">
        {form.guestEmails.map((guest, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="email"
              value={guest}
              onChange={(e) => updateGuest(i, e.target.value)}
              placeholder="guest@company.com"
              aria-label={`Guest ${i + 1} email`}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
            />
            <button
              type="button"
              onClick={() => removeGuest(i)}
              aria-label="Remove guest"
              className="shrink-0 rounded-md p-1.5 text-text-secondary transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => set("guestEmails", [...form.guestEmails, ""])}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <UserPlus className="h-4 w-4" />
          Add guests
        </button>
        <p className="text-xs text-text-muted">
          Loop in other recruiters or board members who should join this call.
        </p>
      </div>

      <p className="text-xs text-text-muted">
        By proceeding, you agree to be contacted by Chatfolio about this meeting.
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
          Confirm
        </button>
      </div>
    </form>
  );
}
