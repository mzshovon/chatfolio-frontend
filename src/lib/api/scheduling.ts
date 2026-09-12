export interface BookingPayload {
  date: string; // yyyy-mm-dd
  startTime: string; // "HH:mm", 24h
  durationMinutes: number;
  timezone: string;
  name: string;
  email: string;
  topic: string;
  notes?: string;
  guestEmails: string[];
}

export interface BookingResult {
  id: string;
  confirmedAt: string;
}

export type SubmitBookingOutcome =
  | { kind: "ok"; booking: BookingResult }
  | { kind: "error"; detail?: string };

/**
 * No scheduling endpoint exists yet — the backend team confirmed this API is
 * still in progress. This simulates the round-trip (including a realistic
 * delay) so the calendar → details → confirmation flow is fully wired end
 * to end; swap the body for a real fetch() once the endpoint lands, keeping
 * this function's shape (resolve `{ kind: "ok" }` = booked, `{ kind: "error" }`
 * = show the inline error state) so nothing else in the widget has to change.
 */
export async function submitBooking(payload: BookingPayload): Promise<SubmitBookingOutcome> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (process.env.NODE_ENV !== "production") {
    console.info("[scheduling] booking requested (no backend yet):", payload);
  }

  return {
    kind: "ok",
    booking: { id: Math.random().toString(36).slice(2, 10), confirmedAt: new Date().toISOString() },
  };
}
