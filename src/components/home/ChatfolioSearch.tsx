"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Briefcase, Loader2, MapPin, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { searchChatfolios } from "@/lib/api/publicChat";
import type { ChatfolioSearchResult, JobType } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 300;

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

/** Wraps the substring of `text` that case-insensitively matches `query` in a <mark>. */
function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <>
      {before}
      <mark className="rounded-sm bg-accent-glow text-accent-hover dark:text-accent">{match}</mark>
      {after}
    </>
  );
}

function recruiterLabel(count: number | null): string | null {
  if (!count) return null;
  return `${count} recruiter${count === 1 ? "" : "s"} reached out`;
}

export function ChatfolioSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [location, setLocation] = useState("");
  const [field, setField] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [results, setResults] = useState<ChatfolioSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasFilters = Boolean(jobType || location.trim() || field.trim());
  const hasAnyInput = Boolean(query.trim() || hasFilters);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!hasAnyInput) {
        setResults([]);
        setLoading(false);
        setErrored(false);
        return;
      }

      setLoading(true);
      setErrored(false);

      try {
        const data = await searchChatfolios(
          {
            username: query,
            location,
            jobType: jobType ?? undefined,
            field,
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        setResults(data.slice(0, MAX_RESULTS));
        setActiveIndex(-1);
      } catch {
        if (controller.signal.aborted) return;
        setErrored(true);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, jobType, location, field, hasAnyInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToSlug(slug: string) {
    setQuery(slug);
    setOpen(false);
    router.push(`/${encodeURIComponent(slug)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        goToSlug(query.trim());
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (pick) goToSlug(pick.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && hasAnyInput;

  const emptyState = useMemo(() => {
    if (!showDropdown || loading) return null;
    if (errored) return "Couldn't load results — try again in a moment.";
    if (hasAnyInput && results.length === 0) return "No matching Chatfolios yet — try a different name, role, or location.";
    return null;
  }, [showDropdown, loading, errored, hasAnyInput, results.length]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-soft transition-shadow",
          "focus-within:border-accent focus-within:shadow-elevated focus-within:ring-4 focus-within:ring-accent-glow"
        )}
      >
        <Search className="h-4.5 w-4.5 shrink-0 text-text-secondary" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, role, or slug — e.g. “Ada”, “Backend Engineer”…"
          aria-label="Search candidates"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="chatfolio-search-results"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-secondary" />}
        {!loading && query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="shrink-0 rounded-md p-0.5 text-text-secondary transition-colors hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-label="Toggle filters"
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary",
            (filtersOpen || hasFilters) && "border-accent bg-accent-soft text-accent-hover dark:text-accent"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
              {[jobType, location.trim(), field.trim()].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle bg-surface-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {JOB_TYPES.map((jt) => (
              <button
                key={jt.value}
                type="button"
                onClick={() => setJobType((cur) => (cur === jt.value ? null : jt.value))}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary",
                  jobType === jt.value && "border-accent bg-accent text-white hover:text-white"
                )}
              >
                {jt.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Area, e.g. London"
              aria-label="Filter by location"
              className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="Profession, e.g. Backend"
              aria-label="Filter by profession"
              className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setJobType(null);
                setLocation("");
                setField("");
              }}
              className="text-xs font-medium text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          id="chatfolio-search-results"
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-elevated"
        >
          {results.map((result, i) => {
            const label = recruiterLabel(result.recruiter_count);
            return (
              <button
                key={result.slug}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => goToSlug(result.slug)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors last:border-b-0",
                  i === activeIndex ? "bg-surface-2" : "hover:bg-surface-2"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {highlightMatch(result.full_name, query)}
                  </p>
                  <p className="truncate text-xs text-text-secondary">@{result.slug}</p>
                </div>
                {label && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-live-subtle px-2 py-1 text-[11px] font-medium text-live">
                    <Users className="h-3 w-3" />
                    {label}
                  </span>
                )}
              </button>
            );
          })}

          {emptyState && (
            <p className="px-4 py-6 text-center text-sm text-text-secondary">{emptyState}</p>
          )}
        </div>
      )}
    </div>
  );
}
