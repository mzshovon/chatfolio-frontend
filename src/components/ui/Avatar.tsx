import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  label: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  /** Green presence dot; `ringClass` must match the background the avatar sits on. */
  online?: boolean;
  ringClass?: string;
  className?: string;
}

const SIZES = {
  sm: { box: "h-9 w-9 text-xs", dot: "h-2.5 w-2.5 border-2" },
  md: { box: "h-12 w-12 text-[15px]", dot: "h-3 w-3 border-2" },
  lg: { box: "h-14 w-14 text-lg", dot: "h-3.5 w-3.5 border-[2.5px]" },
  xl: { box: "h-24 w-24 font-display text-4xl", dot: "h-4 w-4 border-[3px]" },
};

export function Avatar({
  label,
  imageUrl,
  size = "md",
  online = false,
  ringClass = "border-surface",
  className,
}: AvatarProps) {
  const s = SIZES[size];

  return (
    <div className={cn("relative shrink-0 select-none", s.box, className)}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external candidate-supplied URL, not a local asset
        <img src={imageUrl} alt={label} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-accent font-bold text-white">
          {label}
        </div>
      )}
      {online && (
        <span
          className={cn("absolute right-0 bottom-0 rounded-full bg-live", s.dot, ringClass)}
          title="Online"
        />
      )}
    </div>
  );
}
