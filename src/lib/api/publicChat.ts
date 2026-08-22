import { env } from "@/lib/env";
import { ApiError, assertOk, parseErrorDetail } from "./client";
import type { ChatfolioPage, ChatMessageResponse, StartSessionResponse } from "./types";

function chatfolioUrl(slug: string): string {
  return `${env.apiBaseUrl}/public/chatfolio/${encodeURIComponent(slug)}`;
}

export type ChatfolioPageResult =
  | { kind: "ok"; data: ChatfolioPage }
  | { kind: "redirect"; slug: string }
  | { kind: "not-found" };

function extractSlugFromLocation(location: string): string | null {
  const match = location.match(/\/public\/chatfolio\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Server-side fetch of a candidate's public page. Uses `redirect: "manual"` so
 * a renamed slug (307) can be turned into a real Next.js redirect that updates
 * the browser URL, instead of silently rendering the new data under the old path.
 */
export async function fetchChatfolioPage(slug: string): Promise<ChatfolioPageResult> {
  const res = await fetch(chatfolioUrl(slug), {
    redirect: "manual",
    cache: "no-store",
  });

  if (res.status === 307 || res.status === 308) {
    const location = res.headers.get("location");
    const newSlug = location ? extractSlugFromLocation(location) : null;
    if (newSlug && newSlug !== slug) {
      return { kind: "redirect", slug: newSlug };
    }
    // Location header didn't parse as expected — fall back to a normal
    // redirect-following request rather than failing outright.
    const followed = await fetch(chatfolioUrl(slug), { cache: "no-store" });
    if (followed.status === 404) return { kind: "not-found" };
    await assertOk(followed);
    return { kind: "ok", data: await followed.json() };
  }

  if (res.status === 404) return { kind: "not-found" };
  await assertOk(res);
  return { kind: "ok", data: await res.json() };
}

/** Point an <a href> or window.location at this directly — never fetch() it. */
export function getCvDownloadUrl(slug: string): string {
  return `${chatfolioUrl(slug)}/cv`;
}

export async function startChatSession(slug: string): Promise<string> {
  const res = await fetch(`${env.apiBaseUrl}/public/chat/${encodeURIComponent(slug)}/sessions`, {
    method: "POST",
  });
  await assertOk(res);
  const data: StartSessionResponse = await res.json();
  return data.session_id;
}

export type SendMessageOutcome =
  | { kind: "ok"; message: ChatMessageResponse }
  | { kind: "session-expired" }
  | { kind: "validation-error"; detail?: string }
  | { kind: "rate-limited" }
  | { kind: "unavailable" };

export async function sendChatMessage(sessionId: string, content: string): Promise<SendMessageOutcome> {
  const res = await fetch(`${env.apiBaseUrl}/public/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (res.ok) return { kind: "ok", message: await res.json() };
  if (res.status === 404) return { kind: "session-expired" };
  if (res.status === 422) return { kind: "validation-error", detail: await parseErrorDetail(res) };
  if (res.status === 429) return { kind: "rate-limited" };
  if (res.status === 503) return { kind: "unavailable" };

  throw new ApiError(res.status, await parseErrorDetail(res));
}
