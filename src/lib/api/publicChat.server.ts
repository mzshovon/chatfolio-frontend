import "server-only";
import { getBackendApiUrl } from "@/lib/env.server";
import { assertOk, retryFetch } from "./client";
import type { ChatfolioPage } from "./types";

function chatfolioUrl(slug: string): string {
  return `${getBackendApiUrl()}/api/v1/public/chatfolio/${encodeURIComponent(slug)}`;
}

/**
 * This is a genuine server-to-server call (no browser involved), so unlike
 * client-side fetches it carries no Origin header by default. If
 * BACKEND_API_URL points at a public domain sitting behind an nginx gate
 * that does `if ($http_origin !~* ...) return 403;` (as api.chatfolio.net
 * does), the request gets rejected without this. Node's fetch() lets us set
 * Origin manually (a browser wouldn't), so we attach one that's already on
 * that allowlist rather than opening the gate to no-Origin requests.
 */
const SERVER_FETCH_HEADERS = { Origin: "https://chatfolio.chat" };

export type ChatfolioPageResult =
  | { kind: "ok"; data: ChatfolioPage }
  | { kind: "redirect"; slug: string }
  | { kind: "not-found" };

function extractSlugFromLocation(location: string): string | null {
  const match = location.match(/\/public\/chatfolio\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Server-side fetch of a candidate's public page — talks to the backend
 * directly (never through the /api/v1 browser-facing proxy; that would just
 * be an extra hop, since the Next.js server can already reach the backend
 * itself). Uses `redirect: "manual"` so a renamed slug (307) can be turned
 * into a real Next.js redirect that updates the browser URL, instead of
 * silently rendering the new data under the old path.
 */
export async function fetchChatfolioPage(slug: string): Promise<ChatfolioPageResult> {
  const res = await retryFetch(chatfolioUrl(slug), {
    redirect: "manual",
    cache: "no-store",
    headers: SERVER_FETCH_HEADERS,
  });

  if (res.status === 307 || res.status === 308) {
    const location = res.headers.get("location");
    const newSlug = location ? extractSlugFromLocation(location) : null;
    if (newSlug && newSlug !== slug) {
      return { kind: "redirect", slug: newSlug };
    }
    // Location header didn't parse as expected — fall back to a normal
    // redirect-following request rather than failing outright.
    const followed = await retryFetch(chatfolioUrl(slug), {
      cache: "no-store",
      headers: SERVER_FETCH_HEADERS,
    });
    if (followed.status === 404) return { kind: "not-found" };
    await assertOk(followed);
    return { kind: "ok", data: await followed.json() };
  }

  if (res.status === 404) return { kind: "not-found" };
  await assertOk(res);
  return { kind: "ok", data: await res.json() };
}
