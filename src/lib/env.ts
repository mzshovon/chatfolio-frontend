/**
 * Same-origin path every client-side request goes through. src/proxy.ts
 * reverse-proxies anything under this prefix to the real backend
 * (BACKEND_API_URL, server-only) — the browser never talks to the backend
 * directly, so this is a fixed convention, not an env var: it's identical
 * across dev/staging/prod, only the proxy's target changes. This also
 * sidesteps CORS entirely for client-side calls, since the browser only
 * ever sees same-origin requests.
 */
export const API_BASE_PATH = "/api/v1";
