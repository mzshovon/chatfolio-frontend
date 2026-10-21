import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline-dark" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-border disabled:text-text-secondary",
  secondary:
    "border border-border bg-surface text-text-primary hover:border-accent hover:text-accent disabled:opacity-50",
  "outline-dark":
    "border border-hero-border bg-transparent text-hero-text hover:border-accent hover:text-accent disabled:opacity-50",
  ghost: "text-text-secondary hover:text-text-primary disabled:opacity-50",
};

/** Shared pill-button styling, also applied to <a> links so links and buttons stay identical. */
export function buttonClasses(variant: ButtonVariant = "secondary", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    variantClasses[variant],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = "secondary", className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      {children}
    </button>
  );
}
