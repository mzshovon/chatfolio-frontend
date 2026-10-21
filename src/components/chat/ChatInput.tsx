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
    <div className="border-t border-border-subtle bg-surface px-3.5 pt-2.5 pb-3">
      <div className="flex w-full items-end gap-2 rounded-[14px] border-[1.5px] border-border bg-bg p-[5px] pl-3.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-glow)]">
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
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-[opacity,transform]",
            sendDisabled
              ? "cursor-not-allowed bg-border text-text-secondary"
              : "bg-accent text-white hover:scale-105 hover:opacity-90 active:scale-95"
          )}
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={2.5} />
          <span className="sr-only">{isSending ? "Sending…" : "Send"}</span>
        </button>
      </div>
      <div className="flex justify-between gap-2.5 px-1 pt-1.5 text-[11.5px] text-text-muted">
        <span className={overLimit ? "text-error-text" : undefined}>
          {overLimit ? `${charLen}/${maxLength} — too long` : `${charLen}/${maxLength}`}
        </span>
        <span>{cooldownSecondsLeft > 0 ? `sending disabled ${cooldownSecondsLeft}s` : ""}</span>
      </div>
    </div>
  );
}
