export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isPastDay(date: Date, today: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

/** Weeks of Date|null cells (null = padding outside the month) for a given month. */
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function formatMonthLabel(year: number, month: number): { month: string; year: string } {
  const date = new Date(year, month, 1);
  return { month: date.toLocaleDateString("en-US", { month: "long" }), year: String(year) };
}

function ordinalSuffix(day: number): string {
  if (day % 10 === 1 && day !== 11) return "st";
  if (day % 10 === 2 && day !== 12) return "nd";
  if (day % 10 === 3 && day !== 13) return "rd";
  return "th";
}

export function formatSelectedDayShort(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${date.getDate()}${ordinalSuffix(date.getDate())}`;
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** Start times for a business-hours day (9am-5pm) at the given step. */
export function generateTimeSlots(stepMinutes: number): TimeOfDay[] {
  const slots: TimeOfDay[] = [];
  const startMinutes = 9 * 60;
  const endMinutes = 17 * 60;
  for (let m = startMinutes; m < endMinutes; m += stepMinutes) {
    slots.push({ hour: Math.floor(m / 60), minute: m % 60 });
  }
  return slots;
}

export function formatTimeOfDay(time: TimeOfDay, use24h: boolean): string {
  if (use24h) {
    return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
  }
  const period = time.hour >= 12 ? "pm" : "am";
  const displayHour = time.hour % 12 === 0 ? 12 : time.hour % 12;
  return `${displayHour}:${String(time.minute).padStart(2, "0")}${period}`;
}

export function addMinutes(time: TimeOfDay, minutes: number): TimeOfDay {
  const total = time.hour * 60 + time.minute + minutes;
  return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
}

export function formatTimeRange(time: TimeOfDay, durationMinutes: number, use24h: boolean): string {
  return `${formatTimeOfDay(time, use24h)} – ${formatTimeOfDay(addMinutes(time, durationMinutes), use24h)}`;
}

/** True if this slot's start time has already passed, for a slot on `date`. */
export function isSlotInPast(date: Date, time: TimeOfDay, now: Date): boolean {
  if (!isSameDay(date, now)) return isPastDay(date, now);
  const slotDate = new Date(date);
  slotDate.setHours(time.hour, time.minute, 0, 0);
  return slotDate.getTime() < now.getTime();
}

export function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
