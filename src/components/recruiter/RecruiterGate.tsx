"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { useRecruiter, type GateReason } from "@/components/recruiter/RecruiterProvider";
import { cn } from "@/lib/utils/cn";

function copyFor(reason: GateReason, first: string) {
  switch (reason) {
    case "meet":
      return {
        title: "Introduce yourself to book a Meet",
        sub: `${first} needs to know who is inviting them before accepting a call.`,
        cta: "Continue to booking",
      };
    case "cv":
      return {
        title: "Introduce yourself to download the CV",
        sub: `${first} can see who downloaded their CV.`,
        cta: "Download CV",
      };
    case "chat":
      return {
        title: "You've used your 5 anonymous questions",
        sub: `Introduce yourself to keep chatting with ${first}'s AI. Your chat so far stays here.`,
        cta: "Keep chatting",
      };
    default:
      return {
        title: first === "them" ? "Introduce yourself" : `Introduce yourself to ${first}`,
        sub: `${first === "them" ? "Candidates see" : `${first} sees`} who asked what, so recruiters who introduce themselves get faster replies.`,
        cta: "Start chatting",
      };
  }
}

const FIELDS = [
  { key: "name", label: "Your name", placeholder: "e.g. Sam Carter" },
  { key: "title", label: "Designation", placeholder: "e.g. Talent Acquisition Lead" },
  { key: "org", label: "Organization", placeholder: "e.g. Northwind Labs" },
] as const;

export function RecruiterGate() {
  const { gate, recruiter, introduce, goAnonymous, closeGate } = useRecruiter();
  const [form, setForm] = useState({ name: recruiter?.name ?? "", title: recruiter?.title ?? "", org: recruiter?.org ?? "" });
  const [tried, setTried] = useState(false);

  const reason = gate?.reason ?? "intro";
  const first = gate?.candidateName ?? "them";
  const copy = copyFor(reason, first);
  const valid = Boolean(form.name.trim() && form.title.trim() && form.org.trim());
  // First-time prompts offer the anonymous path; later "needs an intro" prompts only let you step back.
  const offersAnonymous = (reason === "intro" || reason === "edit") && !recruiter;
  const canDismiss = reason !== "intro" || Boolean(recruiter);

  // Closing the first-visit prompt without answering keeps the recruiter anonymous.
  const dismiss = () => (reason === "intro" && !recruiter ? goAnonymous() : closeGate());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return setTried(true);
    introduce({ name: form.name.trim(), title: form.title.trim(), org: form.org.trim() });
  }

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-hero/60 p-5 backdrop-blur-sm"
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-modal-in max-h-[calc(100dvh-2.5rem)] w-full max-w-[460px] overflow-y-auto rounded-3xl bg-bg p-7 shadow-2xl"
      >
        <div className="text-xs font-bold tracking-[0.12em] text-accent">BEFORE YOU CHAT</div>
        <h2 id="gate-title" className="font-display mt-2 text-[26px] leading-tight font-semibold text-text-primary">
          {copy.title}
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-text-secondary">{copy.sub}</p>

        <div className="mt-5 flex flex-col gap-3">
          {FIELDS.map((f, i) => (
            <label key={f.key} className="text-[13px] font-semibold text-text-secondary">
              {f.label}
              <input
                value={form[f.key]}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                autoFocus={i === 0}
                className={cn(
                  "mt-1.5 block w-full rounded-xl border-[1.5px] bg-surface px-3.5 py-3 text-[15px] font-normal text-text-primary outline-none focus:border-accent",
                  tried && !form[f.key].trim() ? "border-error-text/60" : "border-border"
                )}
              />
            </label>
          ))}
        </div>
        {tried && !valid && (
          <div className="mt-3 rounded-[10px] bg-error-bg px-3 py-2 text-[13px] text-error-text">
            Please fill in all three fields.
          </div>
        )}

        <button type="submit" className={buttonClasses("primary", "mt-5 w-full rounded-[14px] py-3.5 text-[15px]")}>
          {copy.cta}
        </button>

        {offersAnonymous && (
          <>
            <div className="mt-3.5 flex items-center gap-2.5 text-xs text-text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <button
              type="button"
              onClick={goAnonymous}
              className={buttonClasses("secondary", "mt-3 w-full rounded-[14px] py-3 text-[14.5px] font-semibold hover:text-text-primary")}
            >
              Continue anonymously
            </button>
            <p className="mt-2 text-center text-xs text-text-muted">
              Anonymous: 5 questions. Booking a Meet or downloading the CV needs an introduction.
            </p>
          </>
        )}

        {canDismiss && (
          <button
            type="button"
            onClick={closeGate}
            className="mt-2.5 w-full py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            Not now
          </button>
        )}
        <p className="mt-3 text-xs text-text-muted">Saved in this browser only · no account needed</p>
      </form>
    </div>
  );
}
