import { cn } from "@/lib/utils/cn";

export function Tag({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-md bg-surface-2 px-2.5 py-1 text-[11.5px] text-text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
