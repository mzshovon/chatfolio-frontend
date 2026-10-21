import type { JobType } from "@/lib/api/types";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};
