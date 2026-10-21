"use client";

import { Star } from "lucide-react";
import { useRecruiter, type ShortlistItem } from "@/components/recruiter/RecruiterProvider";
import { cn } from "@/lib/utils/cn";

interface ShortlistStarProps {
  item: ShortlistItem;
  /** "icon" is the round card button; "pill" is a labelled button for the dark hero. */
  variant?: "icon" | "pill";
  className?: string;
}

export function ShortlistStar({ item, variant = "icon", className }: ShortlistStarProps) {
  const { ready, isShortlisted, toggleShortlist } = useRecruiter();
  const on = ready && isShortlisted(item.slug);
  const label = on ? "Remove from shortlist" : "Add to shortlist";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => toggleShortlist(item)}
        aria-pressed={on}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-hero-border px-4 py-3 text-sm font-semibold whitespace-nowrap text-[#e3a83f] transition-colors hover:border-accent",
          className
        )}
      >
        <Star className={cn("h-4 w-4", on && "fill-current")} />
        {on ? "Shortlisted" : "Shortlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleShortlist(item)}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border transition-colors",
        on ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface text-text-muted hover:text-accent",
        className
      )}
    >
      <Star className={cn("h-4 w-4", on && "fill-current")} />
    </button>
  );
}
