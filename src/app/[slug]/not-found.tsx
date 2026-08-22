import Link from "next/link";
import { ErrorState } from "@/components/errors/ErrorState";

export default function ChatfolioNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <ErrorState
        icon="not-found"
        title="This chatfolio isn't available"
        message="The page you're looking for doesn't exist, or isn't published right now."
        action={
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-2"
          >
            ← Back home
          </Link>
        }
      />
    </main>
  );
}
