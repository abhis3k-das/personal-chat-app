"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import MessageBubble from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReact: (messageId: string, reaction: string) => void;
  onToggleFavorite: (messageId: string, isAlreadyFavorite: boolean) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  onReact,
  onToggleFavorite,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-6">
        <p className="text-center text-gray-500">
          Start your little conversation 💕
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onReact={onReact}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}