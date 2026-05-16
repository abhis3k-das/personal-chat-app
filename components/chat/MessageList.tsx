"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import MessageBubble from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  highlightedMessageId?: string | null;
  onReact: (messageId: string, reaction: string) => void;
  onToggleFavorite: (messageId: string, isAlreadyFavorite: boolean) => void;
  onEditMessage: (messageId: string, updatedText: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  highlightedMessageId,
  onReact,
  onToggleFavorite,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, highlightedMessageId]);

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
      {messages.map((message) => {
        const isHighlighted = message.id === highlightedMessageId;

        return (
          <div
            key={message.id}
            ref={(element) => {
              messageRefs.current[message.id] = element;
            }}
            className={
              isHighlighted
                ? "rounded-3xl bg-yellow-100/70 p-2 ring-2 ring-yellow-300"
                : ""
            }
          >
            <MessageBubble
              message={message}
              currentUserId={currentUserId}
              onReact={onReact}
              onToggleFavorite={onToggleFavorite}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}