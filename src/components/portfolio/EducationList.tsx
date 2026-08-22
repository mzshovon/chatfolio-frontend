import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { formatDateRange } from "@/lib/utils/date";
import type { Education } from "@/lib/api/types";

export function EducationList({ education }: { education: Education[] }) {
  if (education.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Education</SectionHeading>
      <div className="flex flex-col gap-2.5">
        {education.map((ed) => (
          <div key={ed.id}>
            <div className="text-[13px] font-semibold text-text-primary">
              {[ed.degree, ed.field].filter(Boolean).join(", ")}
            </div>
            <div className="text-xs text-text-secondary">
              {ed.institution} · {formatDateRange(ed.start_date, ed.end_date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
