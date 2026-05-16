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
  onEditMessage: (messageId: string, updatedText: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

const FIVE_MINUTES = 5 * 60 * 1000;

function formatMessageTime(createdAt: any) {
  if (!createdAt?.toDate) return "";

  return createdAt.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canModifyMessage(createdAt: any) {
  if (!createdAt?.toDate) return false;

  const createdTime = createdAt.toDate().getTime();
  const now = Date.now();

  return now - createdTime <= FIVE_MINUTES;
}

export default function MessageBubble({
  message,
  currentUserId,
  onReact,
  onToggleFavorite,
  onEditMessage,
  onDeleteMessage,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  const isOwnMessage = message.senderId === currentUserId;
  const selectedReaction = message.reactions?.[currentUserId];
  const isFavorite = message.isFavoriteBy?.includes(currentUserId) ?? false;

  const canEditOrDelete = isOwnMessage && canModifyMessage(message.createdAt);

  const handleReaction = (reaction: string) => {
    onReact(message.id, reaction);
    setShowReactions(false);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(message.id, isFavorite);
    setShowMessageMenu(false);
  };

  const handleStartEdit = () => {
    if (!canEditOrDelete) return;

    setEditedText(message.text);
    setIsEditing(true);
    setShowMessageMenu(false);
  };

  const handleSaveEdit = () => {
    const trimmedText = editedText.trim();

    if (!trimmedText) return;
    if (trimmedText === message.text) {
      setIsEditing(false);
      return;
    }

    onEditMessage(message.id, trimmedText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!canEditOrDelete) return;

    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;

    onDeleteMessage(message.id);
    setShowMessageMenu(false);
  };

  return (
    <div className={`relative max-w-[75%] ${isOwnMessage ? "ml-auto" : ""}`}>
      {showReactions && !isEditing && (
        <ReactionPicker onSelectReaction={handleReaction} />
      )}

      <div
        className={`relative rounded-2xl px-4 py-3 shadow-sm ${
          isOwnMessage
            ? "rounded-br-md bg-purple-500 text-white"
            : "rounded-bl-md bg-white text-gray-800"
        } ${
          message.type === "miss_you"
            ? "ring-2 ring-pink-200"
            : message.type === "compliment"
            ? "ring-2 ring-yellow-200"
            : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-purple-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-purple-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowReactions((prev) => !prev)}
                className="w-full text-left"
              >
                <p className="break-words text-sm">{message.text}</p>
              </button>
            )}
          </div>

          {!isEditing && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowMessageMenu((prev) => !prev)}
                className={`rounded-full px-2 py-1 text-sm font-bold leading-none ${
                  isOwnMessage
                    ? "text-purple-100 hover:bg-purple-400"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                title="Message options"
              >
                ⋯
              </button>

              {showMessageMenu && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMessageMenu(false)}
                    className="fixed inset-0 z-20 cursor-default"
                    aria-label="Close message menu"
                  />

                  <div
                    className={`absolute top-8 z-30 w-52 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-purple-100 ${
                      isOwnMessage ? "right-0" : "left-0"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50"
                    >
                      <span>
                        {isFavorite
                          ? "Remove from favorite"
                          : "Add to favorite"}
                      </span>
                      <span>{isFavorite ? "⭐" : "☆"}</span>
                    </button>

                    {isOwnMessage && (
                      <>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          disabled={!canEditOrDelete}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span>Edit message</span>
                          <span>✏️</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={!canEditOrDelete}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span>Delete message</span>
                          <span>🗑️</span>
                        </button>

                        {/* {!canEditOrDelete && (
                          <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                            Edit/Delete expired after 5 minutes
                          </p>
                        )} */}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="mt-2 flex items-center justify-end gap-2">
            {isFavorite && (
              <span
                className={`text-xs ${
                  isOwnMessage ? "text-purple-100" : "text-yellow-500"
                }`}
                title="Favorite message"
              >
                ⭐
              </span>
            )}

            {message.editedAt && (
              <span
                className={`text-xs ${
                  isOwnMessage ? "text-purple-100" : "text-gray-400"
                }`}
              >
                edited
              </span>
            )}

            <p
              className={`text-right text-xs ${
                isOwnMessage ? "text-purple-100" : "text-gray-400"
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
        )}
      </div>

      {selectedReaction && !isEditing && (
        <div
          className={`mt-1 text-sm ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <span className="rounded-full bg-white px-2 py-1 shadow-sm">
            {selectedReaction}
          </span>
        </div>
      )}
    </div>
  );
}