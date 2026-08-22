"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProfileSummary } from "@/components/portfolio/ProfileSummary";
import { ExperienceList } from "@/components/portfolio/ExperienceList";
import { ProjectList } from "@/components/portfolio/ProjectList";
import { SkillsList } from "@/components/portfolio/SkillsList";
import { EducationList } from "@/components/portfolio/EducationList";
import { cn } from "@/lib/utils/cn";
import type { ChatfolioPage } from "@/lib/api/types";

interface PortfolioPanelProps {
  data: ChatfolioPage;
  open: boolean;
  onClose: () => void;
  /** DOM id (see intentSections.ts) to scroll to and briefly highlight once the panel is open. */
  scrollToSectionId?: string | null;
  onScrolledToSection?: () => void;
}

const PANEL_OPEN_ANIMATION_MS = 260;
const HIGHLIGHT_DURATION_MS = 1600;

function Section({
  id,
  highlighted,
  children,
}: {
  id: string;
  highlighted: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-xl transition-colors duration-500",
        highlighted && "-mx-2 bg-accent-soft/70 px-2 py-2 ring-1 ring-accent/40"
      )}
    >
      {children}
    </div>
  );
}

export function PortfolioPanel({
  data,
  open,
  onClose,
  scrollToSectionId,
  onScrolledToSection,
}: PortfolioPanelProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !scrollToSectionId) return;
    const targetId = scrollToSectionId;
    const timer = setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedId(targetId);
      onScrolledToSection?.();
    }, PANEL_OPEN_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open, scrollToSectionId, onScrolledToSection]);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 z-10 animate-slide-in bg-black/28"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${data.full_name}'s portfolio`}
        className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[420px] animate-panel-in flex-col overflow-y-auto border-l border-border bg-surface shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <span className="text-sm font-semibold text-text-primary">Portfolio</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portfolio"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-7 px-5 py-6">
          <ProfileSummary data={data} contactHighlighted={highlightedId === "portfolio-contact"} />
          <Section id="portfolio-experience" highlighted={highlightedId === "portfolio-experience"}>
            <ExperienceList experiences={data.experiences} />
          </Section>
          <Section id="portfolio-projects" highlighted={highlightedId === "portfolio-projects"}>
            <ProjectList projects={data.projects} />
          </Section>
          <Section id="portfolio-skills" highlighted={highlightedId === "portfolio-skills"}>
            <SkillsList skills={data.skills} />
          </Section>
          <EducationList education={data.education} />
        </div>
      </div>
    </>
  );
}
