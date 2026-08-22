import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import type { Skill } from "@/lib/api/types";

export function SkillsList({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Skills</SectionHeading>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Tag key={skill.id} title={skill.category ?? undefined}>
            {skill.name}
          </Tag>
        ))}
      </div>
    </div>
  );
}
