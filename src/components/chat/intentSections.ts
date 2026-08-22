import type { ChatIntent } from "@/lib/api/types";

/** DOM ids the portfolio panel exposes for each section an intent can point at. */
export const INTENT_SECTIONS: Record<ChatIntent, { label: string; sectionId: string }> = {
  contact_request: { label: "Contact", sectionId: "portfolio-contact" },
  project_inquiry: { label: "Projects", sectionId: "portfolio-projects" },
  skill_inquiry: { label: "Skills", sectionId: "portfolio-skills" },
  experience_inquiry: { label: "Experience", sectionId: "portfolio-experience" },
};
