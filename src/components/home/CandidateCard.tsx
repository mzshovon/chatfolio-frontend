"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { ShortlistStar } from "@/components/recruiter/ShortlistStar";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type { ChatfolioSearchResult } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/date";
import { JOB_TYPE_LABELS } from "@/lib/utils/jobType";
import { overlapHours } from "@/lib/utils/overlap";

interface CandidateCardProps {
  result: ChatfolioSearchResult;
  /** Lower-cased search words; matching skills are highlighted. */
  terms: string[];
}

function Fact({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-text-muted">{label}</div>
      <div className={cn("mt-0.5 truncate text-[13.5px] font-bold text-text-primary", valueClass)}>{value}</div>
    </div>
  );
}

export function CandidateCard({ result, terms }: CandidateCardProps) {
  const { recruiter_count: count, years_experience: years, notice_period_days: notice } = result;
  const roleLine = [result.title, result.location].filter(Boolean).join(" · ");
  const { viewer } = useRecruiter();
  const overlap = result.work_hours ? overlapHours(result.work_hours, viewer.timezone) : null;

  const facts = [
    years != null && { label: "Experience", value: `${years} yrs` },
    notice != null && { label: "Can start", value: notice === 0 ? "Immediately" : `${notice} days` },
    overlap != null && {
      label: "Overlap",
      value: overlap ? `${overlap}h` : "None",
      valueClass: overlap >= 3 ? "text-live" : overlap ? "text-warn-text" : "text-error-text",
    },
  ].filter((f): f is { label: string; value: string; valueClass?: string } => Boolean(f));

  return (
    <article className="shadow-soft flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <Avatar label={initials(result.full_name)} imageUrl={result.avatar_url} online ringClass="border-surface" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-text-primary">{result.full_name}</div>
          <div className="truncate text-[13.5px] text-text-secondary">{roleLine || `@${result.slug}`}</div>
          {Boolean(count) && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-live-subtle px-2 py-0.5 text-[11.5px] font-semibold text-live">
              <Users className="h-3 w-3" />
              {count} recruiter{count === 1 ? "" : "s"} reached out
            </div>
          )}
        </div>
        <ShortlistStar
          item={{ slug: result.slug, full_name: result.full_name, title: result.title ?? null, location: result.location ?? null }}
        />
      </div>

      {result.headline && <p className="text-sm leading-normal text-text-secondary">{result.headline}</p>}

      {result.top_skills && result.top_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.top_skills.map((skill) => {
            const hit = terms.some((t) => skill.toLowerCase().includes(t));
            return (
              <Tag
                key={skill}
                className={cn(
                  "border-transparent bg-surface-2 px-2.5 py-1 font-semibold text-text-secondary",
                  hit && "bg-accent-soft text-accent-hover dark:text-accent"
                )}
              >
                {skill}
              </Tag>
            );
          })}
        </div>
      )}

      {facts.length > 0 && (
        <div
          className="grid gap-2 rounded-xl bg-bg px-3 py-2.5"
          style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
        >
          {facts.map((f) => (
            <Fact key={f.label} {...f} />
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2.5">
        <span className="flex-1 text-[12.5px] text-text-muted">
          {[result.current_company, result.job_type && JOB_TYPE_LABELS[result.job_type]].filter(Boolean).join(" · ") ||
            `@${result.slug}`}
        </span>
        <Link
          href={`/${encodeURIComponent(result.slug)}`}
          className={buttonClasses("primary", "px-[18px] py-2.5 text-sm")}
        >
          Chat now
        </Link>
      </div>
    </article>
  );
}
