import { Download, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CvDownloadLink } from "@/components/candidate/CvDownloadLink";
import { ShortlistStar } from "@/components/recruiter/ShortlistStar";
import { buttonClasses } from "@/components/ui/Button";
import { SchedulingTriggerButton } from "@/components/scheduling/SchedulingTriggerButton";
import type { ChatfolioPage } from "@/lib/api/types";
import { formatYears, initials, firstNameFor, totalExperienceYears } from "@/lib/utils/date";
import { JOB_TYPE_LABELS } from "@/lib/utils/jobType";

interface CandidateHeroProps {
  data: ChatfolioPage;
  sessionId: string | null;
  meetingsUnavailable: boolean;
  onOpenScheduling: () => void;
  onOpenProfile: () => void;
}

export function shortlistItem(data: ChatfolioPage) {
  return { slug: data.slug, full_name: data.full_name, title: data.title, location: data.location };
}

export function currentCompany(data: ChatfolioPage): string | null {
  return (data.experiences.find((e) => e.is_current) ?? null)?.company ?? null;
}

/** Only facts the API actually returns; anything missing is simply left out. */
export function buildStats(data: ChatfolioPage): { label: string; value: string }[] {
  const years = totalExperienceYears(data.experiences);
  const company = currentCompany(data);
  return [
    years !== null && { label: "Experience", value: formatYears(years) },
    company && { label: "Currently at", value: company },
    data.job_type && { label: "Open to", value: JOB_TYPE_LABELS[data.job_type] },
    Boolean(data.recruiter_count) && { label: "Recruiters", value: `${data.recruiter_count} reached out` },
  ].filter((s): s is { label: string; value: string } => Boolean(s));
}

export function CandidateStats({ data, className }: { data: ChatfolioPage; className?: string }) {
  const stats = buildStats(data);
  if (stats.length === 0) return null;
  return (
    <div className={className}>
      {stats.map((s) => (
        <div key={s.label} className="bg-hero-2 px-4 py-3">
          <div className="text-xs text-hero-muted">{s.label}</div>
          <div className="mt-0.5 truncate text-[17px] font-bold text-hero-text">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

const STATS_GRID =
  "mt-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-hidden rounded-[14px] border border-hero-border bg-hero-border";

/** Full-width hero, desktop only. */
export function CandidateHero({
  data,
  sessionId,
  meetingsUnavailable,
  onOpenScheduling,
}: Omit<CandidateHeroProps, "onOpenProfile">) {
  const company = currentCompany(data);
  const roleLine = [data.title && company ? `${data.title} at ${company}` : (data.title ?? company), data.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="hidden bg-hero text-hero-text lg:block">
      <div className="mx-auto max-w-[1240px] px-6 pt-6 pb-7">
        <div className="flex flex-wrap items-center gap-[22px]">
          <Avatar
            label={initials(data.full_name)}
            imageUrl={data.avatar_url}
            size="xl"
            online
            ringClass="border-hero"
            className="ring-4 ring-hero-2 rounded-full"
          />
          <div className="min-w-[440px] flex-1">
            <div className="flex flex-wrap gap-2 text-xs font-semibold whitespace-nowrap">
              <span className="rounded-full bg-live/15 px-2.5 py-1 font-bold text-[#7fd3a0]">● Open to work</span>
              {Boolean(data.recruiter_count) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[#e3a83f]">
                  <Sparkles className="h-3 w-3" />
                  {data.recruiter_count} recruiters chatted
                </span>
              )}
            </div>
            <h1 className="font-display mt-2.5 text-[clamp(30px,3.6vw,42px)] leading-[1.1] font-semibold">
              {data.full_name}
            </h1>
            {roleLine && <div className="mt-1.5 text-base text-[#c9cdd1]">{roleLine}</div>}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <SchedulingTriggerButton
              candidateFirstName={firstNameFor(data.full_name)}
              sessionId={sessionId}
              contactEmail={data.contact_email}
              meetingsUnavailable={meetingsUnavailable}
              onOpen={onOpenScheduling}
            />
            {data.cv_downloadable && (
              <CvDownloadLink slug={data.slug} fullName={data.full_name} variant="outline-dark" className="py-3">
                <Download className="h-4 w-4" />
                Download CV
              </CvDownloadLink>
            )}
            <ShortlistStar variant="pill" item={shortlistItem(data)} />
          </div>
        </div>
        <CandidateStats data={data} className={STATS_GRID} />
      </div>
    </section>
  );
}

/** Compact candidate bar for screens where the CV lives in a slide-in sheet. */
export function CandidateBar({
  data,
  sessionId,
  meetingsUnavailable,
  onOpenScheduling,
  onOpenProfile,
}: CandidateHeroProps) {
  const subtitle = [data.title, data.location].filter(Boolean).join(" · ");
  return (
    <div className="flex items-center gap-2.5 bg-hero px-4 py-2.5 text-hero-text lg:hidden">
      <Avatar
        label={initials(data.full_name)}
        imageUrl={data.avatar_url}
        size="sm"
        online
        ringClass="border-hero"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-bold">{data.full_name}</div>
        {subtitle && <div className="truncate text-xs text-hero-muted">{subtitle}</div>}
      </div>
      <ShortlistStar item={shortlistItem(data)} className="border-hero-border bg-transparent" />
      <button type="button" onClick={onOpenProfile} className={buttonClasses("outline-dark", "px-3.5 py-2 text-[13px]")}>
        View CV ›
      </button>
      <SchedulingTriggerButton
        compact
        candidateFirstName={firstNameFor(data.full_name)}
        sessionId={sessionId}
        contactEmail={data.contact_email}
        meetingsUnavailable={meetingsUnavailable}
        onOpen={onOpenScheduling}
      />
    </div>
  );
}
