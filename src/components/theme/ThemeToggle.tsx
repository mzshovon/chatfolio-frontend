"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      aria-pressed={isDark}
      className="relative h-6 w-11 shrink-0 rounded-full border border-border bg-surface-2 transition-colors data-[dark=true]:bg-accent-soft"
      data-dark={isDark}
    >
      <span
        className="absolute top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-white transition-[left] duration-150 ease-out"
        style={{ left: isDark ? "23px" : "2px" }}
      >
        {mounted ? (
          isDark ? (
            <Moon className="h-2.5 w-2.5" strokeWidth={2.5} />
          ) : (
            <Sun className="h-2.5 w-2.5" strokeWidth={2.5} />
          )
        ) : null}
      </span>
    </button>
  );
}
