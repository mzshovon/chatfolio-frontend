import { API_BASE_PATH } from "@/lib/env";
import type { ViewerLocation } from "./types";

export interface ResolvedViewer {
  city: string;
  country: string;
  timezone: string;
}

/** Used whenever the backend can't tell us where the recruiter is. */
export const DEFAULT_VIEWER: ResolvedViewer = {
  city: "Dhaka",
  country: "Bangladesh",
  timezone: "Asia/Dhaka",
};

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Where the recruiter is, as seen by the backend (from the request IP).
 * Proposed endpoint: GET /public/viewer/location. Until it exists — or if it
 * fails, or returns an unusable timezone — everything falls back to Dhaka, so
 * callers always get a complete value and never need to handle an error.
 */
export async function getViewerLocation(signal?: AbortSignal): Promise<ResolvedViewer> {
  try {
    const res = await fetch(`${API_BASE_PATH}/public/viewer/location`, { signal });
    if (!res.ok) return DEFAULT_VIEWER;
    const data: ViewerLocation = await res.json();
    if (!data.timezone || !isValidTimezone(data.timezone)) return DEFAULT_VIEWER;
    return {
      city: data.city?.trim() || data.timezone.split("/").pop()?.replace(/_/g, " ") || DEFAULT_VIEWER.city,
      country: data.country?.trim() || "",
      timezone: data.timezone,
    };
  } catch {
    return DEFAULT_VIEWER;
  }
}
