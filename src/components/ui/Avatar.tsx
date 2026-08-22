import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "accent" | "muted";
  className?: string;
}

const sizeClasses = {
  sm: "h-[26px] w-[26px] text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-[52px] w-[52px] text-lg",
};

export function Avatar({ label, size = "md", variant = "accent", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        variant === "accent"
          ? "bg-accent-soft text-accent"
          : "bg-surface-2 text-text-secondary",
        className
      )}
    >
      {label}
    </div>
  );
}
