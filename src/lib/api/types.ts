export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  impact: string | null;
  links: Record<string, string> | null;
}

export type SkillProficiency = "Beginner" | "Intermediate" | "Excellent" | string;

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency: SkillProficiency | null;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ContactCtaConfig {
  label: string;
  url: string;
}

export interface ChatfolioPage {
  slug: string;
  full_name: string;
  title: string | null;
  location: string | null;
  contact_email: string | null;
  phone: string | null;
  social_links: SocialLinks | null;
  intro: string | null;
  summary: string | null;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  contact_cta_config: ContactCtaConfig | null;
  cv_downloadable: boolean;
}

export interface StartSessionResponse {
  session_id: string;
}

/**
 * The reference doc (PUBLIC_CHAT_UI_REFERENCE.md) describes `intent` as
 * always null, but the live API actually classifies it — confirmed against a
 * real response. Kept nullable since generic questions may not match any of
 * these categories.
 */
export type ChatIntent =
  | "contact_request"
  | "project_inquiry"
  | "skill_inquiry"
  | "experience_inquiry";

export interface ChatMessageResponse {
  role: "assistant";
  content: string;
  intent: ChatIntent | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  intent?: ChatIntent | null;
  pending?: boolean;
}
