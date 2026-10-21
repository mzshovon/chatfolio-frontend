"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { initials } from "@/lib/utils/date";

export function ShortlistDrawer() {
  const { shortlistOpen, setShortlistOpen, shortlist, toggleShortlist } = useRecruiter();
  if (!shortlistOpen) return null;
  const close = () => setShortlistOpen(false);

  return (
    <div onClick={close} className="fixed inset-0 z-[40] flex justify-end bg-hero/35">
      <aside
        role="dialog"
        aria-label="Shortlist"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[min(380px,100%)] flex-col gap-3.5 overflow-y-auto bg-bg p-[22px] shadow-[-20px_0_40px_-20px_rgba(0,0,0,.3)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold text-text-primary">Shortlist</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close shortlist"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {shortlist.length === 0 && (
          <p className="text-sm leading-relaxed text-text-secondary">
            Tap ☆ on any candidate to save them here. Your shortlist is kept for this browser session.
          </p>
        )}

        {shortlist.map((c) => (
          <div key={c.slug} className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-3.5">
            <Avatar label={initials(c.full_name)} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-text-primary">{c.full_name}</div>
              <div className="truncate text-[12.5px] text-text-muted">
                {[c.title, c.location].filter(Boolean).join(" · ") || `@${c.slug}`}
              </div>
            </div>
            <Link
              href={`/${encodeURIComponent(c.slug)}`}
              onClick={close}
              className={buttonClasses("primary", "px-3 py-[7px] text-[12.5px]")}
            >
              Chat
            </Link>
            <button
              type="button"
              onClick={() => toggleShortlist(c)}
              aria-label={`Remove ${c.full_name} from shortlist`}
              className="text-text-muted transition-colors hover:text-error-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}
