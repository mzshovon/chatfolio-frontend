"use client";

import { useRef, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
  cooldownSecondsLeft: number;
  maxLength: number;
  placeholder: string;
}

export function ChatInput({
  draft,
  onDraftChange,
  onSend,
  disabled,
  isSending,
  cooldownSecondsLeft,
  maxLength,
  placeholder,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charLen = draft.length;
  const overLimit = charLen > maxLength;
  const sendDisabled = !draft.trim() || overLimit || disabled;

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendDisabled) onSend();
    }
  }

  return (
    <div className="flex flex-col gap-1.5 border-t border-border bg-surface px-4 py-3.5 sm:px-6">
      <div className="flex items-end gap-2.5">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          aria-label="Send message"
          className={cn(
            "flex h-[42px] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors",
            sendDisabled
              ? "cursor-not-allowed bg-border text-text-secondary"
              : "bg-accent text-white hover:bg-accent-hover"
          )}
        >
          <span className="hidden sm:inline">{isSending ? "Sending…" : "Send"}</span>
          <SendHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      <div className="flex justify-between text-[11px] text-text-secondary">
        <span className={overLimit ? "text-error-text" : undefined}>
          {overLimit ? `${charLen}/${maxLength} — too long` : `${charLen}/${maxLength}`}
        </span>
        <span>{cooldownSecondsLeft > 0 ? `sending disabled ${cooldownSecondsLeft}s` : ""}</span>
      </div>
    </div>
  );
}
