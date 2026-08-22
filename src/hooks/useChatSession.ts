"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { sendChatMessage, startChatSession } from "@/lib/api/publicChat";
import type { ChatMessage } from "@/lib/api/types";

export const MAX_MESSAGE_LENGTH = 2000;
const COOLDOWN_MS = 2000;

export type ChatBannerTone = "warn" | "error";

export interface ChatBanner {
  id: string;
  tone: ChatBannerTone;
  text: string;
  /** When set, renders an action button with this label that calls `restart()`. */
  restartLabel?: string;
}

export type SessionStatus = "connecting" | "ready" | "error";

/**
 * Owns the full lifecycle of the chat widget for one candidate slug: starting
 * a session, sending messages, and translating every documented error case
 * (§3 of PUBLIC_CHAT_UI_REFERENCE.md) into UI state. The session id lives only
 * in this hook's React state — never persisted — matching the doc's guidance
 * that a fresh visit should always start a fresh session.
 */
export function useChatSession(slug: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [banner, setBanner] = useState<ChatBanner | null>(null);

  const cooldownActive = now < cooldownUntil;

  // Only tick while a cooldown is actually counting down, so the countdown
  // label stays live without running an interval for the widget's whole life.
  useEffect(() => {
    if (!cooldownActive) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [cooldownActive]);

  const connect = useCallback(async () => {
    setSessionStatus("connecting");
    setBanner(null);
    try {
      const id = await startChatSession(slug);
      setSessionId(id);
      setSessionStatus("ready");
    } catch (err) {
      setSessionStatus("error");
      if (err instanceof ApiError && err.status === 429) {
        setBanner({
          id: "start-rate-limited",
          tone: "warn",
          text: "Please try again in a moment.",
          restartLabel: "retry",
        });
      } else {
        setBanner({
          id: "start-error",
          tone: "error",
          text: "Chat is currently unavailable.",
          restartLabel: "retry",
        });
      }
    }
  }, [slug]);

  useEffect(() => {
    // `connect` only touches state after its internal `await`, i.e. in a
    // deferred microtask — not synchronously during this effect — so this
    // is the standard "start a session when the widget mounts" fetch effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void connect();
  }, [connect]);

  const restart = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    void connect();
  }, [connect]);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || text.length > MAX_MESSAGE_LENGTH) return;
      if (!sessionId || isSending || cooldownActive) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setDraft("");
      setBanner(null);
      setIsSending(true);

      const outcome = await sendChatMessage(sessionId, text).catch(
        () => ({ kind: "unavailable" as const })
      );

      setIsSending(false);

      switch (outcome.kind) {
        case "ok": {
          const assistantMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: outcome.message.content,
            createdAt: outcome.message.created_at,
            intent: outcome.message.intent,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          // Own client-side cooldown: the doc frames the 2s server cooldown as
          // expected UX to pre-empt with a disabled send button, not an error
          // to branch on — so any 429 we actually receive is the IP rate limit.
          setCooldownUntil(Date.now() + COOLDOWN_MS);
          setNow(Date.now());
          break;
        }
        case "session-expired":
          setBanner({
            id: "session-expired",
            tone: "error",
            text: "This chat is no longer available.",
            restartLabel: "start new chat",
          });
          break;
        case "validation-error":
          setBanner({
            id: "validation-error",
            tone: "warn",
            text: outcome.detail || "That message couldn't be sent — try shortening it.",
          });
          break;
        case "rate-limited":
          setBanner({
            id: "rate-limited",
            tone: "warn",
            text: "You're sending messages too quickly, please slow down.",
          });
          break;
        case "unavailable":
          setBanner({
            id: "unavailable",
            tone: "error",
            text: "Chat is temporarily unavailable, try again shortly.",
          });
          break;
      }
    },
    [sessionId, isSending, cooldownActive]
  );

  const cooldownSecondsLeft = cooldownActive ? Math.ceil((cooldownUntil - now) / 1000) : 0;

  return {
    sessionStatus,
    messages,
    draft,
    setDraft,
    isSending,
    cooldownSecondsLeft,
    inputDisabled: isSending || cooldownActive || sessionStatus !== "ready",
    banner,
    dismissBanner: () => setBanner(null),
    send,
    restart,
    maxMessageLength: MAX_MESSAGE_LENGTH,
  };
}
