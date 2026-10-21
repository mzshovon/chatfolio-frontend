export function formatMonthYear(value: string | null, isCurrent = false): string {
  if (isCurrent) return "Present";
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent = false
): string {
  const startLabel = formatMonthYear(start);
  const endLabel = formatMonthYear(end, isCurrent);
  if (!startLabel && !endLabel) return "";
  if (!endLabel) return startLabel;
  if (!startLabel) return endLabel;
  return `${startLabel} – ${endLabel}`;
}

export function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * A name's first token isn't always a usable first name — honorifics like
 * "Md." or "Dr." end in a period and read oddly mid-sentence ("...and Md..").
 * Picks the first token that isn't one of those, falling back to the literal
 * first token (or the full name) if every token looks like an honorific.
 */
export function firstNameFor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.find((p) => !p.endsWith(".")) ?? parts[0] ?? fullName;
}

/**
 * Total career length in years, with overlapping roles counted once. Returns
 * null when no experience has a usable start date.
 */
export function totalExperienceYears(
  experiences: { start_date: string | null; end_date: string | null; is_current: boolean }[]
): number | null {
  const now = Date.now();
  const spans = experiences
    .map((e) => {
      const start = e.start_date ? new Date(e.start_date).getTime() : NaN;
      const end = e.is_current || !e.end_date ? now : new Date(e.end_date).getTime();
      return [start, end] as const;
    })
    .filter(([s, e]) => !Number.isNaN(s) && !Number.isNaN(e) && e > s)
    .sort((a, b) => a[0] - b[0]);
  if (spans.length === 0) return null;

  let totalMs = 0;
  let [curStart, curEnd] = spans[0];
  for (const [s, e] of spans.slice(1)) {
    if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      totalMs += curEnd - curStart;
      [curStart, curEnd] = [s, e];
    }
  }
  totalMs += curEnd - curStart;
  return totalMs / (365.25 * 24 * 3600 * 1000);
}

export function formatYears(years: number): string {
  if (years < 1) return "<1 yr";
  const rounded = Math.round(years * 10) / 10;
  return `${rounded} ${rounded === 1 ? "yr" : "yrs"}`;
}
