"use client";

import { useIntroPrompt } from "@/components/recruiter/RecruiterProvider";

/** Renders nothing; lets server pages such as the home page trigger the introduction prompt. */
export function IntroPrompt({ id }: { id: string }) {
  useIntroPrompt(id);
  return null;
}
