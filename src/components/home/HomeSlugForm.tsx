"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export function HomeSlugForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = slug.trim();
    if (trimmed) router.push(`/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="candidate-slug"
        aria-label="Chatfolio slug"
        className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary"
      />
      <button
        type="submit"
        disabled={!slug.trim()}
        aria-label="Go to chatfolio"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent p-2.5 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
