import type { ChatIntent } from "@/lib/api/types";

/**
 * DOM ids the portfolio panel exposes for each intent that points at a
 * section. `meeting_request` is deliberately absent — it opens the
 * scheduling modal instead of a portfolio section, handled separately in
 * MessageBubble.
 */
export const INTENT_SECTIONS: Partial<Record<ChatIntent, { label: string; sectionId: string }>> = {
  contact_request: { label: "Contact", sectionId: "portfolio-contact" },
  project_inquiry: { label: "Projects", sectionId: "portfolio-projects" },
  skill_inquiry: { label: "Skills", sectionId: "portfolio-skills" },
  experience_inquiry: { label: "Experience", sectionId: "portfolio-experience" },
};
