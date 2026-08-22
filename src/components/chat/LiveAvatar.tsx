import { cn } from "@/lib/utils/cn";

interface LiveAvatarProps {
  label: string;
  imageUrl?: string | null;
  size?: "sm" | "lg";
  showRing?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "h-[38px] w-[38px]", text: "text-[13px]", dot: "h-2.5 w-2.5 border-2" },
  lg: { box: "h-20 w-20", text: "text-xl", dot: "h-3.5 w-3.5 border-[2.5px]" },
};

/**
 * Header/landing avatar: gradient fallback + "online" indicator, distinct
 * from the flat message-bubble Avatar so the chat thread stays untouched.
 */
export function LiveAvatar({
  label,
  imageUrl,
  size = "sm",
  showRing = false,
  className,
}: LiveAvatarProps) {
  const s = SIZES[size];

  return (
    <div className={cn("relative shrink-0", s.box, className)}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external candidate-supplied URL, not a local asset
        <img
          src={imageUrl}
          alt={label}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full font-semibold text-white select-none",
            s.text
          )}
          style={{ background: "linear-gradient(135deg, #B87A14 0%, #E8A94D 100%)" }}
        >
          {label}
        </div>
      )}
      {showRing && (
        <span
          className="animate-pulse-ring absolute rounded-full border-2 border-live opacity-45"
          style={{ inset: "-3px" }}
          aria-hidden="true"
        />
      )}
      <span
        className={cn("absolute right-0 bottom-0 rounded-full bg-live", s.dot)}
        style={{ borderColor: "var(--bg)" }}
        title="Online"
      />
    </div>
  );
}
