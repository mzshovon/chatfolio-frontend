"use client";

import { useEffect, type ReactNode } from "react";
import { Download, ExternalLink, Mail, Phone, TrendingUp, X } from "lucide-react";
import { CandidateStats } from "@/components/candidate/CandidateHero";
import { CvDownloadLink } from "@/components/candidate/CvDownloadLink";
import { Tag } from "@/components/ui/Tag";
import { buttonClasses } from "@/components/ui/Button";
import type { ChatfolioPage, Skill } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { firstNameFor, formatDateRange } from "@/lib/utils/date";

interface CandidateProfileProps {
  data: ChatfolioPage;
  /** Whether the slide-in sheet is open; ignored on desktop where the CV is always inline. */
  open: boolean;
  onClose: () => void;
  onJump: (sectionId: string) => void;
  highlightedId: string | null;
  onAsk: (text: string) => void;
}

function Section({
  id,
  label,
  highlighted,
  children,
}: {
  id: string;
  label: string;
  highlighted: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "shadow-soft scroll-mt-20 rounded-[20px] border border-border bg-surface p-6 transition-shadow duration-300",
        highlighted && "ring-2 ring-accent"
      )}
    >
      <h2 className="text-xs font-bold tracking-[0.14em] text-text-muted uppercase">{label}</h2>
      {children}
    </section>
  );
}

function AskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 text-[13px] font-semibold text-accent transition-colors hover:text-accent-hover"
    >
      Ask about this →
    </button>
  );
}

function groupSkills(skills: Skill[]): [string | null, Skill[]][] {
  const groups = new Map<string | null, Skill[]>();
  for (const skill of skills) {
    const key = skill.category?.trim() || null;
    groups.set(key, [...(groups.get(key) ?? []), skill]);
  }
  // Uncategorised skills trail the named groups.
  return [...groups.entries()].sort(([a], [b]) => (a === null ? 1 : 0) - (b === null ? 1 : 0));
}

export function CandidateProfile({ data, open, onClose, onJump, highlightedId, onAsk }: CandidateProfileProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const firstName = firstNameFor(data.full_name);
  const socials = Object.entries(data.social_links ?? {}).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );
  const hasAbout = Boolean(
    data.intro || data.summary || socials.length || data.contact_email || data.phone || data.contact_cta_config
  );
  const hl = (id: string) => highlightedId === id;

  const nav = [
    hasAbout && { id: "portfolio-about", label: "About" },
    data.experiences.length > 0 && { id: "portfolio-experience", label: "Experience" },
    data.projects.length > 0 && { id: "portfolio-projects", label: "Projects" },
    data.skills.length > 0 && { id: "portfolio-skills", label: "Skills" },
    data.education.length > 0 && { id: "portfolio-education", label: "Education" },
  ].filter((n): n is { id: string; label: string } => Boolean(n));

  return (
    <>
      {open && (
        <div aria-hidden onClick={onClose} className="fixed inset-0 z-[44] bg-hero/45 lg:hidden" />
      )}
      <div
        data-screen-label="CV"
        className={cn(
          "flex flex-col gap-4 transition-[transform,visibility] duration-300",
          "fixed inset-y-0 right-0 z-[45] w-[min(560px,92vw)] overflow-y-auto bg-bg px-4 pt-[18px] pb-8 shadow-[-24px_0_48px_-24px_rgba(0,0,0,.35)]",
          open ? "visible translate-x-0" : "invisible translate-x-[105%]",
          "lg:visible lg:static lg:z-auto lg:w-auto lg:min-w-0 lg:flex-1 lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none"
        )}
      >
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="font-display min-w-0 flex-1 text-[22px] font-semibold">{firstName}&apos;s CV</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close CV"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-secondary"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <CandidateStats
            data={data}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] bg-hero-border empty:hidden"
          />
          {data.cv_downloadable && (
            <CvDownloadLink slug={data.slug} fullName={data.full_name} variant="secondary" className="w-fit py-2 text-[13px]">
              <Download className="h-3.5 w-3.5" />
              Download CV
            </CvDownloadLink>
          )}
        </div>

        {nav.length > 1 && (
          <nav aria-label="CV sections" className="flex flex-wrap gap-1.5">
            {nav.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onJump(n.id)}
                className="rounded-full border border-border bg-surface px-3.5 py-[7px] text-[13px] font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                {n.label}
              </button>
            ))}
          </nav>
        )}

        {hasAbout && (
          <Section id="portfolio-about" label="About" highlighted={hl("portfolio-about") || hl("portfolio-contact")}>
            {data.intro && (
              <p className="font-display mt-2.5 text-xl leading-[1.55] text-pretty text-text-primary">{data.intro}</p>
            )}
            {data.summary && (
              <p className="mt-3 text-[14.5px] leading-relaxed text-pretty text-text-secondary">{data.summary}</p>
            )}
            <div id="portfolio-contact" className="mt-4 flex flex-wrap items-center gap-2">
              {socials.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-[7px] text-[13px] font-semibold text-text-primary capitalize transition-colors hover:border-accent hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {platform}
                </a>
              ))}
              {data.contact_email && (
                <a
                  href={`mailto:${data.contact_email}`}
                  className="inline-flex items-center gap-1.5 px-1 text-[13px] text-text-secondary transition-colors hover:text-accent"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {data.contact_email}
                </a>
              )}
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="inline-flex items-center gap-1.5 px-1 text-[13px] text-text-secondary transition-colors hover:text-accent"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {data.phone}
                </a>
              )}
              {data.contact_cta_config && (
                <a href={data.contact_cta_config.url} className={buttonClasses("primary", "px-4 py-[7px] text-[13px]")}>
                  {data.contact_cta_config.label}
                </a>
              )}
            </div>
          </Section>
        )}

        {data.experiences.length > 0 && (
          <Section id="portfolio-experience" label="Experience" highlighted={hl("portfolio-experience")}>
            <ol className="mt-3.5 flex flex-col">
              {data.experiences.map((x, i) => {
                const last = i === data.experiences.length - 1;
                const dates = formatDateRange(x.start_date, x.end_date, x.is_current);
                return (
                  <li key={x.id} className="flex gap-4">
                    <div className="flex w-3.5 shrink-0 flex-col items-center">
                      <span
                        className={cn(
                          "mt-[5px] h-3 w-3 rounded-full border-2 border-accent",
                          i === 0 ? "bg-accent" : "bg-surface"
                        )}
                      />
                      {!last && <span className="mt-1 w-0.5 flex-1 bg-border-subtle" />}
                    </div>
                    <div className={cn("min-w-0 flex-1", !last && "pb-5")}>
                      <div className="flex flex-wrap justify-between gap-x-2.5">
                        <div className="text-base font-bold text-text-primary">
                          {x.role} <span className="font-medium text-text-secondary">· {x.company}</span>
                        </div>
                        {dates && <div className="text-[13px] text-text-muted">{dates}</div>}
                      </div>
                      {x.description && (
                        <p className="mt-1 text-[14.5px] leading-relaxed whitespace-pre-line text-text-secondary">
                          {x.description}
                        </p>
                      )}
                      <AskButton onClick={() => onAsk(`What did you do at ${x.company}?`)} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section id="portfolio-projects" label="Projects" highlighted={hl("portfolio-projects")}>
            <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
              {data.projects.map((p) => {
                const links = Object.entries(p.links ?? {}).filter(([, url]) => Boolean(url));
                return (
                  <article
                    key={p.id}
                    className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-bg p-[18px]"
                  >
                    <h3 className="text-base font-bold text-text-primary">{p.title}</h3>
                    {p.impact && (
                      <p className="flex items-start gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1.5 text-[13px] font-semibold text-accent-hover dark:text-accent">
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {p.impact}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-text-secondary">{p.description}</p>
                    {p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.tech_stack.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    )}
                    {links.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {links.map(([name, url]) => (
                          <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-secondary capitalize hover:text-accent"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {name}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto">
                      <AskButton onClick={() => onAsk(`Tell me more about ${p.title}`)} />
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section id="portfolio-skills" label="Skills" highlighted={hl("portfolio-skills")}>
            <div className="mt-3.5 flex flex-col gap-4">
              {groupSkills(data.skills).map(([category, skills]) => (
                <div key={category ?? "other"}>
                  {category && <div className="mb-2 text-[13px] font-semibold text-text-secondary">{category}</div>}
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Tag
                        key={s.id}
                        title={s.proficiency ?? undefined}
                        className="border-transparent bg-surface-2 px-3.5 py-[7px] text-sm font-semibold"
                      >
                        {s.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {data.education.length > 0 && (
          <Section id="portfolio-education" label="Education" highlighted={hl("portfolio-education")}>
            <ul className="mt-3 flex flex-col gap-3">
              {data.education.map((e) => {
                const years = formatDateRange(e.start_date, e.end_date);
                return (
                  <li key={e.id}>
                    <div className="text-[15px] font-bold text-text-primary">
                      {[e.degree, e.field].filter(Boolean).join(" in ")}
                    </div>
                    <div className="mt-0.5 text-[13.5px] text-text-secondary">
                      {[e.institution, years].filter(Boolean).join(" · ")}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}
