import { API_BASE_PATH } from "@/lib/env";
import type { ViewerLocation } from "./types";

export interface ResolvedViewer {
  /** IANA name, e.g. "Asia/Dhaka". */
  timezone: string;
  /** Label for the top bar, e.g. "Dhaka, Bangladesh (GMT+6)". */
  display: string;
}

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Where the recruiter is, as seen by the backend (from the request IP):
 * GET /public/viewer/location, which always answers 200 and nulls every field
 * when it can't tell. Returns null in that case — and on any failure or
 * unusable timezone — so callers hide the location instead of guessing.
 */
export async function getViewerLocation(signal?: AbortSignal): Promise<ResolvedViewer | null> {
  try {
    const res = await fetch(`${API_BASE_PATH}/public/viewer/location`, { signal });
    if (!res.ok) return null;
    const data: ViewerLocation = await res.json();
    if (!data.timezone || !isValidTimezone(data.timezone)) return null;
    const display = data.display?.trim() || [data.city, data.country].filter(Boolean).join(", ");
    return display ? { timezone: data.timezone, display } : null;
  } catch {
    return null;
  }
}
