import "server-only";

/**
 * Origin of the real backend (e.g. "http://backend:8000" inside the Docker
 * network, "http://localhost:8000" in local dev) — never exposed to the
 * browser. Read fresh on every call rather than cached at module scope, so
 * the same built image can be pointed at a different backend per
 * environment (docker run -e BACKEND_API_URL=...) without a rebuild.
 *
 * Throws when unset — callers decide what that means for them: a Server
 * Component render fails loudly (caught by error.tsx) rather than silently
 * fetching from `undefined`.
 */
export function getBackendApiUrl(): string {
  const raw = process.env.BACKEND_API_URL;
  if (!raw) {
    throw new Error(
      "BACKEND_API_URL is not set. Set it in your environment (see .env.example)."
    );
  }
  return raw.replace(/\/+$/, "");
}
