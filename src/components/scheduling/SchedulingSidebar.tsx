import Image from "next/image";
import { Clock, Globe, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatFullDate, formatTimeRange, type TimeOfDay } from "@/lib/utils/calendar";

interface SchedulingSidebarProps {
  candidateFirstName: string;
  durationMinutes: 30 | 60;
  onDurationChange?: (minutes: 30 | 60) => void;
  selectedDate?: Date | null;
  selectedTime?: TimeOfDay | null;
  timezone: string;
}

export function SchedulingSidebar({
  candidateFirstName,
  durationMinutes,
  onDurationChange,
  selectedDate,
  selectedTime,
  timezone,
}: SchedulingSidebarProps) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-5 border-border-subtle px-5 py-5 sm:w-[270px] sm:border-r sm:py-6 sm:pl-6 sm:pr-8">
      <div>
        <Image
          src="/Logo-light.png"
          alt="Chatfolio"
          width={178}
          height={89}
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/Logo-dark.png"
          alt="Chatfolio"
          width={178}
          height={89}
          className="hidden h-7 w-auto dark:block"
        />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg leading-snug font-semibold text-text-primary">
          {durationMinutes}-minute call
        </h3>
        <p className="text-sm text-text-secondary">
          A quick call between a recruiter and {candidateFirstName}.
        </p>
      </div>

      {selectedDate && selectedTime ? (
        <div className="flex items-start gap-2.5 text-sm text-text-primary">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
          <div>
            <p>{formatFullDate(selectedDate)}</p>
            <p className="text-text-secondary">{formatTimeRange(selectedTime, durationMinutes, false)}</p>
          </div>
        </div>
      ) : (
        onDurationChange && (
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-text-secondary" />
            <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
              {([30, 60] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDurationChange(value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    durationMinutes === value
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {value === 30 ? "30m" : "1h"}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      <div className="flex items-center gap-2.5 text-sm text-text-secondary">
        <Video className="h-4 w-4 shrink-0" />
        Video call — link shared after booking
      </div>

      <div className="flex items-center gap-2.5 text-sm text-text-secondary">
        <Globe className="h-4 w-4 shrink-0" />
        {timezone}
      </div>
    </div>
  );
}
