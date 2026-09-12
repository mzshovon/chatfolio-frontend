import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  WEEKDAY_LABELS,
  formatMonthLabel,
  formatSelectedDayShort,
  formatTimeOfDay,
  generateTimeSlots,
  getMonthGrid,
  isPastDay,
  isSameDay,
  isSlotInPast,
  type TimeOfDay,
} from "@/lib/utils/calendar";

/** How many months ahead a recruiter can browse — there's no real availability API yet. */
const MAX_MONTHS_AHEAD = 2;

interface CalendarStepProps {
  today: Date;
  viewYear: number;
  viewMonth: number;
  onNavigateMonth: (direction: -1 | 1) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  durationMinutes: 30 | 60;
  use24h: boolean;
  onToggle24h: (value: boolean) => void;
  selectedTime: TimeOfDay | null;
  onSelectTime: (time: TimeOfDay) => void;
}

export function CalendarStep({
  today,
  viewYear,
  viewMonth,
  onNavigateMonth,
  selectedDate,
  onSelectDate,
  durationMinutes,
  use24h,
  onToggle24h,
  selectedTime,
  onSelectTime,
}: CalendarStepProps) {
  const weeks = getMonthGrid(viewYear, viewMonth);
  const { month, year } = formatMonthLabel(viewYear, viewMonth);

  const monthsFromToday = (viewYear - today.getFullYear()) * 12 + (viewMonth - today.getMonth());
  const canGoPrev = monthsFromToday > 0;
  const canGoNext = monthsFromToday < MAX_MONTHS_AHEAD;

  const slots = generateTimeSlots(durationMinutes);
  const availableSlots = selectedDate
    ? slots.filter((slot) => !isSlotInPast(selectedDate, slot, today))
    : [];

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <div className="flex-1 border-border-subtle px-5 py-5 sm:border-r sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            {month} <span className="text-text-secondary">{year}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onNavigateMonth(-1)}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateMonth(1)}
              disabled={!canGoNext}
              aria-label="Next month"
              className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-semibold tracking-wide text-text-muted">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1.5">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.flatMap((week, wi) =>
            week.map((date, di) => {
              if (!date) return <div key={`${wi}-${di}`} />;

              const past = isPastDay(date, today);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  disabled={past}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                    past && "cursor-not-allowed text-text-muted opacity-40",
                    !past && !isSelected && "text-text-primary hover:bg-surface-2",
                    isSelected && "bg-accent font-semibold text-white"
                  )}
                >
                  {date.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" aria-hidden />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex w-full flex-col px-5 py-5 sm:w-[220px] sm:px-6 sm:py-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">
            {selectedDate ? formatSelectedDayShort(selectedDate) : "Pick a day"}
          </h4>
          {selectedDate && (
            <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onToggle24h(false)}
                className={cn(
                  "rounded px-1.5 py-0.5 font-medium transition-colors",
                  !use24h ? "bg-accent text-white" : "text-text-secondary"
                )}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() => onToggle24h(true)}
                className={cn(
                  "rounded px-1.5 py-0.5 font-medium transition-colors",
                  use24h ? "bg-accent text-white" : "text-text-secondary"
                )}
              >
                24h
              </button>
            </div>
          )}
        </div>

        {!selectedDate && (
          <p className="text-sm text-text-secondary">Choose an available day to see open times.</p>
        )}

        {selectedDate && availableSlots.length === 0 && (
          <p className="text-sm text-text-secondary">No times left today — try another day.</p>
        )}

        {selectedDate && availableSlots.length > 0 && (
          <div className="flex max-h-[19rem] flex-col gap-2 overflow-y-auto pr-1">
            {availableSlots.map((slot) => {
              const isSelected =
                selectedTime && selectedTime.hour === slot.hour && selectedTime.minute === slot.minute;
              return (
                <button
                  key={`${slot.hour}:${slot.minute}`}
                  type="button"
                  onClick={() => onSelectTime(slot)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-border text-text-primary hover:border-accent hover:bg-accent-soft"
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isSelected ? "bg-white" : "bg-live")}
                    aria-hidden
                  />
                  {formatTimeOfDay(slot, use24h)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
