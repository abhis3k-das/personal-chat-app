"use client";

import { useRef, useState } from "react";
import { COMPLIMENTS } from "@/constants/compliments";
import { MessageType } from "@/types/message";
import { DEFAULT_THEME_ID, THEMES, ThemeId } from "@/constants/themes";

interface ChatInputProps {
  themeId?: ThemeId;
  onSendMessage: (text: string, type?: MessageType) => void;
  onTypingChange: (isTyping: boolean) => void;
}

export default function ChatInput({
  themeId = DEFAULT_THEME_ID,
  onSendMessage,
  onTypingChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedTheme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
  const isDarkTheme = themeId === "black";

  const handleTyping = (value: string) => {
    setMessage(value);

    onTypingChange(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange(false);
    }, 1500);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage, "text");
    setMessage("");
    onTypingChange(false);
  };

  const handleMissYou = () => {
    onSendMessage("I miss you ❤️", "miss_you");
  };

  const handleCompliment = () => {
    const randomIndex = Math.floor(Math.random() * COMPLIMENTS.length);
    const compliment = COMPLIMENTS[randomIndex];

    onSendMessage(compliment, "compliment");
  };

  return (
    <div
      className={`border-t px-4 py-3 sm:px-5 sm:py-4 ${
        isDarkTheme
          ? "border-purple-900 bg-black/90"
          : `${selectedTheme.border} bg-white/90`
      }`}
    >
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={handleMissYou}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
            isDarkTheme
              ? "bg-rose-950 text-rose-200 hover:bg-rose-900"
              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
          }`}
        >
          I miss you ❤️
        </button>

        <button
          type="button"
          onClick={handleCompliment}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
            isDarkTheme
              ? "bg-yellow-950 text-yellow-200 hover:bg-yellow-900"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          }`}
        >
          Send compliment ✨
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Write something cute..."
          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none ${
            isDarkTheme
              ? "border-purple-900 bg-gray-950 text-purple-100 placeholder:text-gray-500 focus:border-purple-500"
              : `${selectedTheme.border} bg-white text-gray-800 placeholder:text-gray-400 focus:border-purple-500`
          }`}
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSend}
          className={`shrink-0 rounded-xl px-4 py-3 font-semibold text-white shadow-md disabled:opacity-60 ${selectedTheme.primary} ${selectedTheme.primaryHover}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}