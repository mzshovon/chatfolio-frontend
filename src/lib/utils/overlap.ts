import type { WorkHours } from "@/lib/api/types";

const RECRUITER_DAY: [number, number] = [9, 18];

function toHours(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) + (m || 0) / 60;
}

/** UTC offset in hours for an IANA zone right now; null if the zone is unknown. */
export function zoneOffsetHours(timeZone: string): number | null {
  try {
    const label = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    if (!label) return null;
    if (label === "GMT") return 0;
    const match = label.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!match) return null;
    return (match[1] === "-" ? -1 : 1) * (Number(match[2]) + Number(match[3] ?? 0) / 60);
  } catch {
    return null;
  }
}

/** "GMT+6", "GMT+5:30", "GMT−4" for display. */
export function formatGmtOffset(timeZone: string): string {
  const off = zoneOffsetHours(timeZone);
  if (off === null) return "";
  const abs = Math.abs(off);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `GMT${off < 0 ? "−" : "+"}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/**
 * Hours per day a candidate's working window overlaps a 9-to-6 day in the
 * recruiter's time zone. Null when it can't be worked out.
 */
export function overlapHours(work: WorkHours, recruiterTimezone: string): number | null {
  const candOffset = zoneOffsetHours(work.timezone);
  const recOffset = zoneOffsetHours(recruiterTimezone);
  if (candOffset === null || recOffset === null) return null;
  const start = toHours(work.start);
  const end = toHours(work.end);

  let hours = 0;
  for (let rec = RECRUITER_DAY[0]; rec < RECRUITER_DAY[1]; rec += 0.5) {
    const cand = (((rec - recOffset + candOffset) % 24) + 24) % 24;
    const on = end > start ? cand >= start && cand < end : cand >= start || cand < end;
    if (on) hours += 0.5;
  }
  return hours;
}
