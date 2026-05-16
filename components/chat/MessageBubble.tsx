"use client";

import { useState } from "react";
import { Message } from "@/types/message";
import ReactionPicker from "@/components/chat/ReactionPicker";
import ReadReceipt from "@/components/chat/ReadReceipt";

interface MessageBubbleProps {
    message: Message;
    currentUserId: string;
    onReact: (messageId: string, reaction: string) => void;
    onToggleFavorite: (messageId: string, isAlreadyFavorite: boolean) => void;
}

function formatMessageTime(createdAt: any) {
    if (!createdAt?.toDate) return "";

    return createdAt.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MessageBubble({
    message,
    currentUserId,
    onReact,
    onToggleFavorite,
}: MessageBubbleProps) {
    const [showReactions, setShowReactions] = useState(false);

    const isOwnMessage = message.senderId === currentUserId;
    const selectedReaction = message.reactions?.[currentUserId];
    const isFavorite = message.isFavoriteBy?.includes(currentUserId) ?? false;

    const handleReaction = (reaction: string) => {
        onReact(message.id, reaction);
        setShowReactions(false);
    };

    return (
        <div className={`relative max-w-[75%] ${isOwnMessage ? "ml-auto" : ""}`}>
            {showReactions && <ReactionPicker onSelectReaction={handleReaction} />}

            <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                        ? "rounded-br-md bg-purple-500 text-white"
                        : "rounded-bl-md bg-white text-gray-800"
                    } ${message.type === "miss_you"
                        ? "ring-2 ring-pink-200"
                        : message.type === "compliment"
                            ? "ring-2 ring-yellow-200"
                            : ""
                    }`}
            >
                <button
                    type="button"
                    onClick={() => setShowReactions((prev) => !prev)}
                    className="w-full text-left"
                >
                    <p className="text-sm">{message.text}</p>
                </button>

                <div className="mt-2 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(message.id, isFavorite)}
                        className={`text-sm ${isOwnMessage ? "text-purple-100" : "text-gray-400"
                            }`}
                        title={isFavorite ? "Remove favorite" : "Add favorite"}
                    >
                        {isFavorite ? "⭐" : "☆"}
                    </button>

                    <p
                        className={`text-right text-xs ${isOwnMessage ? "text-purple-100" : "text-gray-400"
                            }`}
                    >
                        {formatMessageTime(message.createdAt)}
                        {isOwnMessage && (
                            <>
                                {" "}
                                <ReadReceipt status={message.status} />
                            </>
                        )}
                    </p>
                </div>
            </div>

            {selectedReaction && (
                <div className={`mt-1 text-sm ${isOwnMessage ? "text-right" : "text-left"}`}>
                    <span className="rounded-full bg-white px-2 py-1 shadow-sm">
                        {selectedReaction}
                    </span>
                </div>
            )}
        </div>
    );
}