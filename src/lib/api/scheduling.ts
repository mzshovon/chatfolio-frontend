import { API_BASE_PATH } from "@/lib/env";
import { ApiError, parseErrorDetail } from "./client";

export interface MeetingRequestPayload {
  /**
   * Optional extra integrity check — if sent, the backend 404s unless it
   * matches the session's candidate. The public chatfolio payload doesn't
   * expose a candidate's user id today, so this is normally left unset; it's
   * wired through so a caller that does have it can pass it straight in.
   */
  userId?: string;
  attendeeEmail: string;
  attendeeName?: string;
  /** ISO 8601 with a UTC offset, e.g. `new Date(...).toISOString()`. */
  start: string;
  durationMinutes: number;
  timezone: string;
  message?: string;
  /** Comma-separated emails of other recruiters/board members to add as guests. */
  additionalAttendees?: string;
  /** Idempotency key — reuse the same value across retries of one attempt. */
  requestId: string;
}

export interface MeetingResult {
  meet_link: string | null;
  title: string;
  start: string;
  end: string;
  timezone: string;
}

export type RequestMeetingOutcome =
  | { kind: "ok"; meeting: MeetingResult }
  | { kind: "session-expired" }
  | { kind: "unavailable-permanently" }
  | { kind: "validation-error"; detail?: string }
  | { kind: "rate-limited" }
  | { kind: "service-unavailable" };

/**
 * See PUBLIC_CHAT_UI_REFERENCE.md §6 — tied to an existing chat session, not
 * the candidate's slug directly; the candidate is resolved server-side from
 * `sessionId`. Creates the event on the candidate's Google Calendar and
 * emails the invite to `attendeeEmail`.
 */
export async function requestMeeting(
  sessionId: string,
  payload: MeetingRequestPayload
): Promise<RequestMeetingOutcome> {
  const res = await fetch(`${API_BASE_PATH}/public/chat/sessions/${encodeURIComponent(sessionId)}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: payload.userId || undefined,
      attendee_email: payload.attendeeEmail,
      attendee_name: payload.attendeeName || undefined,
      start: payload.start,
      duration_minutes: payload.durationMinutes,
      timezone: payload.timezone,
      message: payload.message || undefined,
      additional_attendees: payload.additionalAttendees || undefined,
      request_id: payload.requestId,
    }),
  });

  if (res.status === 201) return { kind: "ok", meeting: await res.json() };
  if (res.status === 404) return { kind: "session-expired" };
  if (res.status === 409) return { kind: "unavailable-permanently" };
  if (res.status === 422) return { kind: "validation-error", detail: await parseErrorDetail(res) };
  if (res.status === 429) return { kind: "rate-limited" };
  if (res.status === 503) return { kind: "service-unavailable" };

  throw new ApiError(res.status, await parseErrorDetail(res));
}
