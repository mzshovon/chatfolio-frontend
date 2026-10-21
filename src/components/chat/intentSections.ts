import type { ChatIntent } from "@/lib/api/types";

/**
 * Which CV section (DOM id in CandidateProfile) each classified intent
 * points at. `meeting_request` is deliberately absent — it opens the
 * scheduling modal instead, handled separately in MessageBubble — and
 * `unknown` has no source to show.
 */
export const INTENT_SECTIONS: Partial<Record<ChatIntent, { label: string; sectionId: string }>> = {
  contact_request: { label: "Contact", sectionId: "portfolio-contact" },
  project_inquiry: { label: "Projects", sectionId: "portfolio-projects" },
  skill_inquiry: { label: "Skills", sectionId: "portfolio-skills" },
  experience_inquiry: { label: "Experience", sectionId: "portfolio-experience" },
  role_fit_inquiry: { label: "Experience", sectionId: "portfolio-experience" },
  education_inquiry: { label: "Education", sectionId: "portfolio-education" },
  availability_inquiry: { label: "About", sectionId: "portfolio-about" },
  general_introduction: { label: "About", sectionId: "portfolio-about" },
};
