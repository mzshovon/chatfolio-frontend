"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/errors/ErrorState";

export default function ChatfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <ErrorState
        icon="unavailable"
        title="Something went wrong"
        message="We couldn't load this chatfolio right now. This is usually temporary — try again in a moment."
        action={
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Try again
          </button>
        }
      />
    </main>
  );
}
