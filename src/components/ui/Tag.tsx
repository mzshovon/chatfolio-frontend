import { cn } from "@/lib/utils/cn";

export function Tag({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-[3px] text-xs text-text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
