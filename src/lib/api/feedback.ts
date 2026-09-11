import { API_BASE_PATH } from "@/lib/env";
import { ApiError, parseErrorDetail } from "./client";

export interface FeedbackPayload {
  /** 0-5, required by the API. */
  npsScore: number;
  /** Optional, ≤2100 chars server-side (the widget caps input at 2000). */
  message?: string;
}

export interface FeedbackResponse {
  id: string;
  nps_score: number;
  message: string | null;
  created_at: string;
}

export type SubmitFeedbackOutcome =
  | { kind: "ok"; feedback: FeedbackResponse }
  | { kind: "validation-error"; detail?: string }
  | { kind: "rate-limited" };

/** See PUBLIC_CHAT_UI_REFERENCE.md §4 — standalone, not tied to a slug or chat session. */
export async function submitFeedback(payload: FeedbackPayload): Promise<SubmitFeedbackOutcome> {
  const res = await fetch(`${API_BASE_PATH}/public/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nps_score: payload.npsScore,
      message: payload.message?.trim() || null,
    }),
  });

  if (res.status === 201) return { kind: "ok", feedback: await res.json() };
  if (res.status === 422) return { kind: "validation-error", detail: await parseErrorDetail(res) };
  if (res.status === 429) return { kind: "rate-limited" };

  throw new ApiError(res.status, await parseErrorDetail(res));
}
