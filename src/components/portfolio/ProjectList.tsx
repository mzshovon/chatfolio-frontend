import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/lib/api/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Projects</SectionHeading>
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-1.5 rounded-xl border border-border p-3.5"
          >
            <div className="text-[13px] font-semibold text-text-primary">{project.title}</div>
            <div className="text-xs leading-relaxed text-text-secondary">
              {project.description}
            </div>
            {project.tech_stack.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            )}
            {project.impact && (
              <div className="mt-0.5 text-xs text-accent">{project.impact}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
