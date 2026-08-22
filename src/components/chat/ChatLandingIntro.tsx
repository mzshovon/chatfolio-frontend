"use client";

import { LiveAvatar } from "@/components/chat/LiveAvatar";
import { initials } from "@/lib/utils/date";
import type { ChatfolioPage } from "@/lib/api/types";

interface ChatLandingIntroProps {
  data: ChatfolioPage;
  suggestions: string[];
  onPick: (text: string) => void;
  disabled: boolean;
}

function buildOpeningLine(data: ChatfolioPage, firstName: string): string {
  const latest = data.experiences[0];
  const topSkills = data.skills.slice(0, 2).map((s) => s.name);

  const workClause = latest ? `their work as ${latest.role} at ${latest.company}` : null;
  const skillsClause = topSkills.length > 0 ? `skills like ${topSkills.join(" and ")}` : null;
  const clauses = [workClause, skillsClause].filter((c): c is string => Boolean(c));

  if (clauses.length === 0) {
    return `Hi — I'm ${firstName}'s AI, grounded in their profile. What would you like to know?`;
  }
  return `Hi — I'm ${firstName}'s AI. I know about ${clauses.join(" and ")}, and what drives their work. What would you like to know?`;
}

export function ChatLandingIntro({ data, suggestions, onPick, disabled }: ChatLandingIntroProps) {
  const firstName = data.full_name.split(" ")[0] || data.full_name;
  const openingLine = buildOpeningLine(data, firstName);
  const previewSkills = data.skills.slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-10 pt-2 pb-2">
      <div className="flex flex-col items-center gap-3.5">
        <LiveAvatar label={initials(data.full_name)} imageUrl={data.avatar_url} size="lg" />
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-2xl text-text-primary">{data.full_name}</span>
          {(data.title || data.location) && (
            <span className="text-[13px] text-text-secondary">
              {[data.title, data.location].filter(Boolean).join(" · ")}
            </span>
          )}
          {previewSkills.length > 0 && (
            <div className="mt-0.5 flex flex-wrap justify-center gap-1.5">
              {previewSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="shadow-soft rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-[clamp(28px,5vw,42px)] leading-[1.15] text-balance text-text-primary">
          Ask me <em className="text-accent italic">anything</em>
          <br />
          about {firstName}
        </h1>
        <p className="max-w-[42ch] text-balance text-[15px] leading-relaxed text-text-secondary">
          I&apos;m an AI answering on {firstName}&apos;s behalf, grounded in their profile —
          experience, projects, and skills.
        </p>
      </div>

      <div className="shadow-elevated flex w-full items-start gap-2.5 rounded-2xl rounded-tl-[4px] border border-border bg-surface px-4 py-3.5">
        <LiveAvatar
          label={initials(data.full_name)}
          imageUrl={data.avatar_url}
          size="sm"
          className="mt-0.5"
        />
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-semibold tracking-wide text-accent uppercase">
            {firstName}&apos;s AI
          </span>
          <p className="text-sm leading-relaxed text-text-primary">
            {openingLine}
            <span
              className="animate-blink ml-0.5 inline-block h-[13px] w-[1.5px] rounded-sm bg-accent align-middle"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>

      {Boolean(data.recruiter_count) && (
        <div className="-mt-6 flex items-center gap-2 text-xs text-text-muted">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full bg-live"
            style={{ boxShadow: "0 0 0 3px var(--live-subtle)" }}
            aria-hidden="true"
          />
          <span>{data.recruiter_count} recruiters connected this month</span>
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-3">
        <span className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
          Suggested questions
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((text) => (
            <button
              key={text}
              type="button"
              disabled={disabled}
              onClick={() => onPick(text)}
              className="shadow-soft rounded-full border border-border bg-surface px-4 py-2.5 text-[13.5px] text-text-secondary transition-all hover:-translate-y-px hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              style={{ transitionProperty: "border-color, color, background-color, transform, box-shadow" }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
