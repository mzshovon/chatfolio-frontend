"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { formatGmtOffset } from "@/lib/utils/overlap";

export function RecruiterHeader() {
  const { ready, recruiter, viewer, shortlist, setShortlistOpen, openGate } = useRecruiter();

  const place = [viewer.city, viewer.country].filter(Boolean).join(", ");
  const offset = formatGmtOffset(viewer.timezone);
  const recruiterInitials = recruiter
    ? recruiter.name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" aria-label="Chatfolio home" className="flex shrink-0 items-center">
          <Image src="/Logo-light.png" alt="Chatfolio" width={178} height={89} className="h-10 w-auto dark:hidden" priority />
          <Image src="/Logo-dark.png" alt="Chatfolio" width={178} height={89} className="hidden h-10 w-auto dark:block" priority />
        </Link>
        <span className="hidden border-l border-border pl-3.5 text-xs font-bold tracking-[0.12em] text-text-muted md:inline">
          FOR RECRUITERS
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-[13px] text-text-secondary" title={viewer.timezone}>
            <span className="hidden lg:inline">You&apos;re in</span>
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-[7px] font-semibold text-text-primary">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              {place} {offset && <span className="font-medium text-text-muted">({offset})</span>}
            </span>
          </div>

          {ready && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-1.5 pl-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-text-primary text-[11px] font-bold text-bg">
                {recruiterInitials}
              </span>
              <span className="hidden max-w-[160px] truncate text-[13px] font-semibold whitespace-nowrap text-text-primary sm:inline">
                {recruiter ? `${recruiter.name.split(" ")[0]} · ${recruiter.org}` : "Anonymous"}
              </span>
              <button
                type="button"
                onClick={() => openGate({ reason: "edit" })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap",
                  recruiter ? "bg-surface-2 text-text-secondary hover:text-text-primary" : "bg-accent text-white hover:bg-accent-hover"
                )}
              >
                {recruiter ? "Edit" : "Introduce yourself"}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShortlistOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Shortlist
            <span className="rounded-full bg-text-primary px-[7px] py-px text-[11.5px] text-bg">{ready ? shortlist.length : 0}</span>
          </button>

          <a
            href="https://panel.chatfolio.net/register"
            className="hidden text-[13px] font-semibold text-text-secondary transition-colors hover:text-accent md:inline"
          >
            I&apos;m a candidate
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
