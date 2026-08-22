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
    <div className="sticky bottom-0 z-10 border-t border-border-subtle bg-bg px-4 pt-3.5 pb-4 sm:px-6">
      <div className="shadow-elevated mx-auto flex w-full max-w-[700px] items-end gap-2.5 rounded-[13px] border border-border bg-surface p-2 pl-4 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-glow)]">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-[120px] min-h-[36px] flex-1 resize-none border-none bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          aria-label="Send message"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] transition-[opacity,transform]",
            sendDisabled
              ? "cursor-not-allowed bg-border text-text-secondary"
              : "bg-accent text-white hover:scale-105 hover:opacity-90 active:scale-95"
          )}
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={2.5} />
          <span className="sr-only">{isSending ? "Sending…" : "Send"}</span>
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-[700px] justify-between px-1 pt-2 text-[11px] text-text-muted">
        <span className={overLimit ? "text-error-text" : undefined}>
          {overLimit ? `${charLen}/${maxLength} — too long` : `${charLen}/${maxLength}`}
        </span>
        <span>{cooldownSecondsLeft > 0 ? `sending disabled ${cooldownSecondsLeft}s` : ""}</span>
      </div>
    </div>
  );
}
