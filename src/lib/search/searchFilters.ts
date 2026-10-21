import type { SearchFilterConfig } from "@/lib/api/types";

/**
 * Static stand-in for the proposed search-filters endpoint, in the exact
 * response shape so swapping it for a fetch is a one-line change in
 * getSearchFilters(). Each option's `params` are sent verbatim to the search
 * endpoint.
 */
export const SEARCH_FILTERS: SearchFilterConfig = {
  groups: [
    {
      key: "work",
      label: "Work",
      options: [
        { value: "remote", label: "Remote", params: { job_type: "remote" } },
        { value: "hybrid", label: "Hybrid", params: { job_type: "hybrid" } },
        { value: "onsite", label: "Onsite", params: { job_type: "onsite" } },
      ],
    },
    {
      key: "start",
      label: "Start",
      options: [
        { value: "immediately", label: "Immediately", params: { max_notice_days: 0 } },
        { value: "30", label: "≤30 days", params: { max_notice_days: 30 } },
      ],
    },
    {
      key: "exp",
      label: "Exp.",
      options: [
        { value: "0-2", label: "0–2", params: { min_experience: 0, max_experience: 2 } },
        { value: "3-5", label: "3–5", params: { min_experience: 3, max_experience: 5 } },
        { value: "6+", label: "6+", params: { min_experience: 6 } },
      ],
    },
  ],
  popular_searches: ["React remote", "Backend Go", "Product designer", "Flutter", "Data analyst Dhaka"],
};
