"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RecruiterGate } from "@/components/recruiter/RecruiterGate";
import { ShortlistDrawer } from "@/components/recruiter/ShortlistDrawer";
import { useHasMounted } from "@/hooks/useHasMounted";
import { DEFAULT_VIEWER, getViewerLocation, type ResolvedViewer } from "@/lib/api/viewer";
import { useStoredJson } from "@/lib/storage/useStoredJson";

export interface Recruiter {
  name: string;
  title: string;
  org: string;
}

export interface ShortlistItem {
  slug: string;
  full_name: string;
  title: string | null;
  location: string | null;
}

export type GateReason = "intro" | "edit" | "meet" | "cv" | "chat";

export interface GateRequest {
  reason: GateReason;
  /** First name of the candidate the gate copy refers to, if any. */
  candidateName?: string;
  /** Runs after the recruiter introduces themselves (not on anonymous/dismiss). */
  onDone?: () => void;
}

interface RecruiterContextValue {
  ready: boolean;
  recruiter: Recruiter | null;
  viewer: ResolvedViewer;
  shortlist: ShortlistItem[];
  isShortlisted: (slug: string) => boolean;
  toggleShortlist: (item: ShortlistItem) => void;
  shortlistOpen: boolean;
  setShortlistOpen: (open: boolean) => void;
  openGate: (request: GateRequest) => void;
  /** Opens the introduction popup once per `id` per page load, if the recruiter is still unknown. */
  promptIntro: (id: string, candidateName?: string) => void;
  introduce: (recruiter: Recruiter) => void;
  goAnonymous: () => void;
  closeGate: () => void;
  gate: GateRequest | null;
  flash: (message: string) => void;
}

const RecruiterContext = createContext<RecruiterContextValue | null>(null);

export function useRecruiter(): RecruiterContextValue {
  const ctx = useContext(RecruiterContext);
  if (!ctx) throw new Error("useRecruiter must be used inside <RecruiterProvider>");
  return ctx;
}

const RECRUITER_KEY = "cf_recruiter";
const SHORTLIST_KEY = "cf_shortlist";
const TOAST_MS = 2600;

const isString = (v: unknown): v is string => typeof v === "string";

function parseRecruiter(v: unknown): Recruiter | null {
  const r = v as Partial<Recruiter> | null;
  return r && isString(r.name) && isString(r.title) && isString(r.org) ? { name: r.name, title: r.title, org: r.org } : null;
}

function parseShortlist(v: unknown): ShortlistItem[] | null {
  if (!Array.isArray(v)) return null;
  return v
    .filter((i): i is ShortlistItem => Boolean(i) && isString(i.slug) && isString(i.full_name))
    .map((i) => ({ slug: i.slug, full_name: i.full_name, title: i.title ?? null, location: i.location ?? null }));
}

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const ready = useHasMounted();
  // The introduction survives reloads; the shortlist lasts for this tab's session.
  const [recruiter, setRecruiter] = useStoredJson("local", RECRUITER_KEY, parseRecruiter);
  const [storedShortlist, setShortlist] = useStoredJson("session", SHORTLIST_KEY, parseShortlist);
  const shortlist = useMemo(() => storedShortlist ?? [], [storedShortlist]);

  const prompted = useRef(new Set<string>());
  const [gate, setGate] = useState<GateRequest | null>(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [viewer, setViewer] = useState<ResolvedViewer>(DEFAULT_VIEWER);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getViewerLocation(controller.signal).then((v) => !controller.signal.aborted && setViewer(v));
    return () => controller.abort();
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const flash = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), TOAST_MS);
  }, []);

  const isShortlisted = useCallback((slug: string) => shortlist.some((i) => i.slug === slug), [shortlist]);

  const toggleShortlist = useCallback(
    (item: ShortlistItem) => {
      const exists = shortlist.some((i) => i.slug === item.slug);
      setShortlist(exists ? shortlist.filter((i) => i.slug !== item.slug) : [...shortlist, item]);
      flash(exists ? "Removed from shortlist" : `${item.full_name} added to shortlist`);
    },
    [shortlist, setShortlist, flash]
  );

  const openGate = useCallback((request: GateRequest) => setGate(request), []);
  const promptIntro = useCallback((id: string, candidateName?: string) => {
    if (prompted.current.has(id)) return;
    prompted.current.add(id);
    setGate((current) => current ?? { reason: "intro", candidateName });
  }, []);
  const closeGate = useCallback(() => setGate(null), []);

  const introduce = useCallback(
    (rec: Recruiter) => {
      const done = gate?.onDone;
      setRecruiter(rec);
      setGate(null);
      flash(`Thanks, ${rec.name.split(" ")[0]}. Your introduction is saved.`);
      done?.();
    },
    [gate, setRecruiter, flash]
  );

  const goAnonymous = useCallback(() => {
    setGate(null);
    flash("You can introduce yourself anytime from the top bar");
  }, [flash]);

  const value = useMemo<RecruiterContextValue>(
    () => ({
      ready,
      recruiter,
      viewer,
      shortlist,
      isShortlisted,
      toggleShortlist,
      shortlistOpen,
      setShortlistOpen,
      openGate,
      promptIntro,
      introduce,
      goAnonymous,
      closeGate,
      gate,
      flash,
    }),
    [ready, recruiter, viewer, shortlist, isShortlisted, toggleShortlist, shortlistOpen, openGate, promptIntro, introduce, goAnonymous, closeGate, gate, flash]
  );

  return (
    <RecruiterContext.Provider value={value}>
      {children}
      {gate && <RecruiterGate />}
      <ShortlistDrawer />
      {toast && (
        <div
          role="status"
          className="animate-slide-in fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-hero px-[18px] py-[11px] text-sm font-medium text-hero-text shadow-lg"
        >
          {toast}
        </div>
      )}
    </RecruiterContext.Provider>
  );
}

/**
 * Pops the introduction prompt for an unknown or anonymous recruiter. Anonymous
 * is never remembered across reloads, so every fresh landing asks again; each
 * `id` (a page or a candidate) asks at most once per page load.
 */
export function useIntroPrompt(id: string, candidateName?: string) {
  const { ready, recruiter, promptIntro } = useRecruiter();
  useEffect(() => {
    if (ready && !recruiter) promptIntro(id, candidateName);
  }, [ready, recruiter, promptIntro, id, candidateName]);
}
