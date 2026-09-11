"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Star, X } from "lucide-react";
import { submitFeedback } from "@/lib/api/feedback";
import { cn } from "@/lib/utils/cn";

const MAX_MESSAGE_LENGTH = 2000;
const STAR_VALUES = [1, 2, 3, 4, 5];
const RATING_LABELS: Record<number, string> = {
  1: "Not great",
  2: "Could be better",
  3: "It's okay",
  4: "Good",
  5: "Excellent",
};

type Status = "idle" | "submitting" | "success" | "error";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const displayRating = hoverRating || rating;
  // nps_score is required by the API; the UI only exposes 1-5 via stars (0 is
  // a valid score server-side, but isn't reachable without an explicit
  // "no stars" affordance we don't have), so require a star pick to submit.
  const canSubmit = rating > 0 && status !== "submitting";

  const close = useCallback(() => {
    setOpen(false);
    // Let the close animation play out before wiping the form.
    setTimeout(() => {
      setRating(0);
      setHoverRating(0);
      setMessage("");
      setStatus("idle");
      setErrorMessage(null);
    }, 200);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMessage(null);
    try {
      const outcome = await submitFeedback({ npsScore: rating, message: message.trim() });
      if (outcome.kind === "ok") {
        setStatus("success");
      } else if (outcome.kind === "rate-limited") {
        setStatus("error");
        setErrorMessage("You're submitting feedback too quickly — please try again in a moment.");
      } else {
        setStatus("error");
        setErrorMessage(outcome.detail || "We couldn't submit that — please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong sending your feedback. Please try again.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-elevated transition-colors hover:bg-surface-2 sm:bottom-6 sm:right-6"
      >
        <MessageSquare className="h-4 w-4 text-accent" />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={close}
            className="absolute inset-0 animate-slide-in bg-black/40 backdrop-blur-[2px]"
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="relative z-10 w-full max-w-md animate-modal-in rounded-2xl border border-border bg-surface p-6 shadow-elevated sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-title" className="font-display text-2xl text-text-primary">
                  {status === "success" ? "Thank you!" : "Send feedback"}
                </h2>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {status === "success"
                    ? "We've received your feedback and appreciate you taking the time."
                    : "Tell us how Chatfolio is working for you."}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close feedback"
                className="shrink-0 text-text-secondary transition-colors hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "success" ? (
              <button
                type="button"
                onClick={close}
                className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Done
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2">
                  <div
                    role="radiogroup"
                    aria-label="Rate your experience out of 5 stars"
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {STAR_VALUES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        onMouseEnter={() => setHoverRating(value)}
                        onFocus={() => setHoverRating(value)}
                        onClick={() => setRating((cur) => (cur === value ? 0 : value))}
                        className="rounded-md p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            value <= displayRating
                              ? "fill-accent text-accent"
                              : "fill-none text-border"
                          )}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="h-4 text-xs font-medium text-text-secondary">
                    {RATING_LABELS[displayRating] ?? ""}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-message" className="sr-only">
                    What are you looking for?
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={4}
                    placeholder="What's working well, or what should we fix?"
                    className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
                  />
                  <span className="self-end text-xs text-text-muted">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>

                {status === "error" && errorMessage && (
                  <p className="rounded-lg bg-error-bg px-3 py-2 text-xs text-error-text">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
                >
                  {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
