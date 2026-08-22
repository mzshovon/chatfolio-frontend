"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ProfileSummary } from "@/components/portfolio/ProfileSummary";
import { ExperienceList } from "@/components/portfolio/ExperienceList";
import { ProjectList } from "@/components/portfolio/ProjectList";
import { SkillsList } from "@/components/portfolio/SkillsList";
import { EducationList } from "@/components/portfolio/EducationList";
import type { ChatfolioPage } from "@/lib/api/types";

interface PortfolioPanelProps {
  data: ChatfolioPage;
  open: boolean;
  onClose: () => void;
}

export function PortfolioPanel({ data, open, onClose }: PortfolioPanelProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
          <ProfileSummary data={data} />
          <ExperienceList experiences={data.experiences} />
          <ProjectList projects={data.projects} />
          <SkillsList skills={data.skills} />
          <EducationList education={data.education} />
        </div>
      </div>
    </>
  );
}
