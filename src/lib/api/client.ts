/**
 * Every endpoint in this API returns `{"detail": "..."}` on error and never a
 * machine-readable error code — callers must branch on `status`, not on `detail`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, detail?: string) {
    super(detail || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function parseErrorDetail(res: Response): Promise<string | undefined> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
  } catch {
    // No JSON body — nothing to extract.
  }
  return undefined;
}

export async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorDetail(res));
  }
}
/**
 * Node error codes worth retrying — all describe a transient failure to
 * even reach the server (a DNS hiccup, connection refused/reset mid-setup),
 * not an application-level error. A real HTTP error response (4xx/5xx) is
 * never retried here — only "the request never got a response at all."
 * EAI_AGAIN specifically is Node's own name for "temporary failure in name
 * resolution" — a retry is the documented-correct response, not a
 * workaround.
 */
const RETRYABLE_ERROR_CODES = new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
]);

function isRetryableFetchError(err: unknown): boolean {
  const cause = err instanceof Error ? (err.cause as { code?: string } | undefined) : undefined;
  return typeof cause?.code === "string" && RETRYABLE_ERROR_CODES.has(cause.code);
}

/**
 * fetch() wrapper that retries a couple of times, with a short backoff,
 * ONLY for the transient network/DNS failures in RETRYABLE_ERROR_CODES —
 * never for a real HTTP error response, which callers keep handling via
 * assertOk()/status checks exactly as before. Server-side use only: a
 * client-side equivalent would silently stall the UI for a few extra
 * seconds on a real backend outage instead of surfacing it, which is the
 * wrong tradeoff there.
 */
export async function retryFetch(
  input: string | URL,
  init?: RequestInit,
  attempts = 3,
  baseDelayMs = 200
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      lastError = err;
      if (!isRetryableFetchError(err) || attempt === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}
