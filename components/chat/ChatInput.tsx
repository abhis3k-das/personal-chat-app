"use client";

import { useRef, useState } from "react";
import { COMPLIMENTS } from "@/constants/compliments";
import { MessageType } from "@/types/message";

interface ChatInputProps {
  onSendMessage: (text: string, type?: MessageType) => void;
  onTypingChange: (isTyping: boolean) => void;
}

export default function ChatInput({
  onSendMessage,
  onTypingChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="border-t border-purple-100 bg-white/90 px-4 py-3 sm:px-5 sm:py-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={handleMissYou}
          className="shrink-0 rounded-xl bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-200"
        >
          I miss you ❤️
        </button>

        <button
          type="button"
          onClick={handleCompliment}
          className="shrink-0 rounded-xl bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-200"
        >
          Send compliment ✨
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Write something cute..."
          className="min-w-0 flex-1 rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-500"
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
          className="shrink-0 rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white shadow-md hover:bg-purple-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}