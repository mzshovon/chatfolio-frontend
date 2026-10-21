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

export type JobType = "remote" | "onsite" | "hybrid";

export interface ChatfolioPage {
  slug: string;
  full_name: string;
  title: string | null;
  location: string | null;
  job_type: JobType | null;
  /**
   * Not documented in PUBLIC_CHAT_UI_REFERENCE.md today — the endpoint has no
   * photo field yet. Kept optional so the UI degrades to an initials avatar
   * until the backend actually adds one, without breaking either way.
   */
  avatar_url?: string | null;
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
  recruiter_count: number | null;
}

export interface WorkHours {
  /** 24h "HH:MM" in `timezone`. An end at or before the start means the shift wraps past midnight. */
  start: string;
  end: string;
  /** IANA name, e.g. "Asia/Dhaka". */
  timezone: string;
}

/**
 * One row from GET /public/chatfolio/search. Only the first three fields are
 * returned today; the rest are the proposed card fields (see
 * SEARCH_CARD_PROPOSAL in the PR notes) and are optional so the UI works
 * before and after the backend ships them.
 */
export interface ChatfolioSearchResult {
  slug: string;
  full_name: string;
  recruiter_count: number | null;
  title?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  /** One-line pitch, <=140 chars, derived server-side from the approved intro/summary. */
  headline?: string | null;
  current_company?: string | null;
  job_type?: JobType | null;
  years_experience?: number | null;
  /** 0 = can start immediately. */
  notice_period_days?: number | null;
  /** Up to 5, most relevant first. */
  top_skills?: string[];
  work_hours?: WorkHours | null;
}

/** Shape of the proposed GET /public/chatfolio/search/filters response. */
export interface SearchFilterOption {
  value: string;
  label: string;
  /** Query params this option adds to /public/chatfolio/search. */
  params: Record<string, string | number>;
}

export interface SearchFilterGroup {
  key: string;
  label: string;
  options: SearchFilterOption[];
}

export interface SearchFilterConfig {
  groups: SearchFilterGroup[];
  popular_searches: string[];
}

export interface StartSessionResponse {
  session_id: string;
}

export type ChatIntent =
  | "skill_inquiry"
  | "project_inquiry"
  | "experience_inquiry"
  | "education_inquiry"
  | "role_fit_inquiry"
  | "availability_inquiry"
  | "contact_request"
  | "meeting_request"
  | "general_introduction"
  | "unknown";

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

/** Shape of the proposed GET /public/viewer/location response. Every field may be null. */
export interface ViewerLocation {
  city: string | null;
  country: string | null;
  /** IANA name, e.g. "Asia/Dhaka". */
  timezone: string | null;
}
