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
