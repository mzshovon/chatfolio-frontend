import { API_BASE_PATH } from "@/lib/env";
import { ApiError, assertOk, parseErrorDetail } from "./client";
import type { ChatfolioSearchResult, ChatMessageResponse, JobType, StartSessionResponse } from "./types";

/**
 * Client-side calls only — same-origin, relative paths. src/proxy.ts
 * reverse-proxies these to the real backend, so the browser never needs (or
 * is able) to resolve the backend's actual origin, and never has to deal
 * with CORS. For the server-side page fetch, see publicChat.server.ts.
 */

function chatfolioUrl(slug: string): string {
  return `${API_BASE_PATH}/public/chatfolio/${encodeURIComponent(slug)}`;
}

/** Point an <a href> or window.location at this directly — never fetch() it. */
export function getCvDownloadUrl(slug: string): string {
  return `${chatfolioUrl(slug)}/cv`;
}

export interface ChatfolioSearchParams {
  username?: string;
  location?: string;
  jobType?: JobType;
  field?: string;
}

/**
 * Recruiter-facing discovery. All params optional and combine with AND;
 * called with none of them the backend returns the 25 most recently
 * published Chatfolios. An empty array is a normal "no matches" result, not
 * an error — never a 404.
 */
export async function searchChatfolios(
  params: ChatfolioSearchParams = {},
  signal?: AbortSignal
): Promise<ChatfolioSearchResult[]> {
  const query = new URLSearchParams();
  if (params.username?.trim()) query.set("username", params.username.trim());
  if (params.location?.trim()) query.set("location", params.location.trim());
  if (params.jobType) query.set("job_type", params.jobType);
  if (params.field?.trim()) query.set("field", params.field.trim());

  const qs = query.toString();
  const res = await fetch(`${API_BASE_PATH}/public/chatfolio/search${qs ? `?${qs}` : ""}`, { signal });
  await assertOk(res);
  return res.json();
}

export async function startChatSession(slug: string): Promise<string> {
  const res = await fetch(`${API_BASE_PATH}/public/chat/${encodeURIComponent(slug)}/sessions`, {
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
  const res = await fetch(`${API_BASE_PATH}/public/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
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
