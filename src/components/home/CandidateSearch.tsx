"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Search, X } from "lucide-react";
import { useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { CandidateCard } from "@/components/home/CandidateCard";
import { buttonClasses } from "@/components/ui/Button";
import { getSearchFilters, searchChatfolios } from "@/lib/api/publicChat";
import type { ChatfolioSearchResult, SearchFilterConfig } from "@/lib/api/types";
import { SEARCH_FILTERS } from "@/lib/search/searchFilters";
import { cn } from "@/lib/utils/cn";
import { overlapHours } from "@/lib/utils/overlap";

const DEBOUNCE_MS = 300;
const MIN_OVERLAP_HOURS = 2;
const STOP_WORDS = new Set(["in", "and", "for", "a", "the", "developer", "with"]);

type Selected = Record<string, string | null>;

/**
 * `username` only matches the slug and `field` only matches title/bio/roles,
 * and the API ANDs params together. To let one search box cover both a name
 * and a role, run both lookups and merge by slug.
 */
async function searchBoth(
  query: string,
  filters: Record<string, string | number>,
  signal: AbortSignal
): Promise<ChatfolioSearchResult[]> {
  const q = query.trim();
  if (!q) return searchChatfolios({ filters }, signal);

  const [byName, byField] = await Promise.all([
    searchChatfolios({ filters, username: q }, signal),
    searchChatfolios({ filters, field: q }, signal),
  ]);
  const seen = new Set<string>();
  return [...byName, ...byField].filter((r) => !seen.has(r.slug) && seen.add(r.slug));
}

/**
 * Re-applies the selected filters to rows that carry the matching field, so
 * results stay correct even if the backend doesn't enforce a param yet. Rows
 * missing a field are left alone — absence isn't a mismatch.
 */
function matchesFilters(r: ChatfolioSearchResult, p: Record<string, string | number>): boolean {
  if (p.job_type !== undefined && r.job_type != null && r.job_type !== p.job_type) return false;
  if (typeof p.max_notice_days === "number" && r.notice_period_days != null && r.notice_period_days > p.max_notice_days)
    return false;
  if (r.years_experience != null) {
    if (typeof p.min_experience === "number" && r.years_experience < p.min_experience) return false;
    if (typeof p.max_experience === "number" && r.years_experience >= p.max_experience + 1) return false;
  }
  return true;
}

export function CandidateSearch() {
  const { viewer } = useRecruiter();
  const [config, setConfig] = useState<SearchFilterConfig>(SEARCH_FILTERS);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Selected>({});
  const [overlapOnly, setOverlapOnly] = useState(false);

  // Loading is derived: a response is "settled" only for the query it answered.
  const [response, setResponse] = useState<{ key: string; results: ChatfolioSearchResult[]; errored: boolean } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    getSearchFilters()
      .then((c) => !cancelled && setConfig(c))
      .catch(() => {}); // keep the static config
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge each selected option's params into one query-param object.
  const filterParams = useMemo(() => {
    const merged: Record<string, string | number> = {};
    for (const group of config.groups) {
      const option = group.options.find((o) => o.value === selected[group.key]);
      if (option) Object.assign(merged, option.params);
    }
    return merged;
  }, [config, selected]);
  const filterKey = JSON.stringify(filterParams);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(draft), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  const requestKey = `${query}|${filterKey}`;
  useEffect(() => {
    const controller = new AbortController();
    searchBoth(query, JSON.parse(filterKey), controller.signal)
      .then((results) => !controller.signal.aborted && setResponse({ key: requestKey, results, errored: false }))
      .catch(() => !controller.signal.aborted && setResponse({ key: requestKey, results: [], errored: true }));
    return () => controller.abort();
  }, [query, filterKey, requestKey]);

  const loading = response?.key !== requestKey;
  const results = useMemo(() => response?.results ?? [], [response]);
  const errored = !loading && Boolean(response?.errored);

  // The overlap toggle only makes sense once candidates carry working hours.
  const canFilterOverlap = Boolean(viewer) && results.some((r) => r.work_hours);
  const visible = useMemo(
    () =>
      results.filter(
        (r) =>
          matchesFilters(r, filterParams) &&
          (!overlapOnly || !viewer || !r.work_hours || (overlapHours(r.work_hours, viewer.timezone) ?? 0) >= MIN_OVERLAP_HOURS)
      ),
    [results, filterParams, overlapOnly, viewer]
  );

  const terms = useMemo(
    () => query.toLowerCase().split(/[\s,]+/).filter((w) => w && !STOP_WORDS.has(w)),
    [query]
  );

  const anyFilter = Object.values(selected).some(Boolean) || overlapOnly;
  const hasAnyInput = Boolean(query.trim()) || anyFilter;

  function pick(prompt: string) {
    setDraft(prompt);
    setQuery(prompt);
  }

  function resetAll() {
    setDraft("");
    setQuery("");
    setSelected({});
    setOverlapOnly(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(draft);
        }}
        className="shadow-elevated mx-auto flex max-w-[820px] items-center gap-3 rounded-[20px] border-[1.5px] border-border bg-surface py-2 pr-2 pl-5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-glow"
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-text-muted" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Try “React developer remote” or “Python Dhaka”"
          aria-label="Search candidates"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-[16.5px] text-text-primary outline-none placeholder:text-text-muted"
        />
        {draft && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => pick("")}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-secondary transition-colors hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="rounded-[14px] bg-text-primary px-[22px] py-[13px] text-[14.5px] font-bold text-bg">
          Search
        </button>
      </form>

      {config.popular_searches.length > 0 && (
        <div className="mx-auto mt-3.5 flex max-w-[820px] flex-wrap items-center justify-center gap-2">
          <span className="text-[12.5px] text-text-muted">Popular:</span>
          {config.popular_searches.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => pick(p)}
              className="rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 border-b border-border-subtle pb-4">
        {config.groups.map((group) => (
          <div key={group.key} role="group" aria-label={group.label} className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
            <span className="pr-2 pl-2.5 text-xs font-semibold text-text-muted">{group.label}</span>
            {[{ value: null, label: "Any" }, ...group.options].map((o) => {
              const active = (selected[group.key] ?? null) === o.value;
              return (
                <button
                  key={o.value ?? "any"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected((s) => ({ ...s, [group.key]: o.value }))}
                  className={cn(
                    "rounded-full px-[11px] py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "bg-text-primary text-bg" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        ))}
        {canFilterOverlap && (
          <button
            type="button"
            aria-pressed={overlapOnly}
            onClick={() => setOverlapOnly((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
              overlapOnly
                ? "border-text-primary bg-text-primary text-bg"
                : "border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            Overlaps my hours
          </button>
        )}
        {anyFilter && (
          <button
            type="button"
            onClick={() => {
              setSelected({});
              setOverlapOnly(false);
            }}
            className="px-2 py-2 text-[13px] font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 flex h-5 items-center gap-2 text-sm text-text-secondary">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
        ) : (
          !errored && (
            <span>
              <b className="text-text-primary">{visible.length}</b> {visible.length === 1 ? "candidate" : "candidates"}{" "}
              {query.trim() ? `for “${query.trim()}”` : "open to work"}
            </span>
          )
        )}
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-4">
        {visible.map((r) => (
          <CandidateCard key={r.slug} result={r} terms={terms} />
        ))}
      </div>

      {errored && (
        <div className="mt-4 rounded-[20px] border border-dashed border-border bg-surface px-5 py-12 text-center text-sm text-text-secondary">
          Couldn&apos;t load candidates — try again in a moment.
        </div>
      )}

      {!loading && !errored && visible.length === 0 && (
        <div className="mt-4 rounded-[20px] border border-dashed border-border bg-surface px-5 py-14 text-center">
          <div className="font-display text-[22px] font-semibold text-text-primary">No candidates match yet</div>
          <p className="mt-1.5 text-sm text-text-secondary">
            Try fewer filters, or a broader word like “frontend” or “Dhaka”.
          </p>
          {hasAnyInput && (
            <button type="button" onClick={resetAll} className={buttonClasses("primary", "mt-4 bg-text-primary text-bg hover:bg-text-primary/85")}>
              Show all candidates
            </button>
          )}
        </div>
      )}
    </div>
  );
}
