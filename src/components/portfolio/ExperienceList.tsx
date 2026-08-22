import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { formatDateRange } from "@/lib/utils/date";
import type { Experience } from "@/lib/api/types";

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Experience</SectionHeading>
      <div className="flex flex-col gap-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="flex flex-col gap-0.5">
            <div className="text-[13px] font-semibold text-text-primary">
              {exp.role} · {exp.company}
            </div>
            <div className="text-xs text-text-secondary">
              {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
            </div>
            <div className="mt-1 text-[13px] leading-relaxed text-text-primary">
              {exp.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
