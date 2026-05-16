"use client";

import { REACTIONS } from "@/constants/reactions";

interface ReactionPickerProps {
  onSelectReaction: (reaction: string) => void;
}

export default function ReactionPicker({ onSelectReaction }: ReactionPickerProps) {
  return (
    <div className="absolute bottom-full mb-2 flex gap-1 rounded-full bg-white px-3 py-2 shadow-lg">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction}
          type="button"
          onClick={() => onSelectReaction(reaction)}
          className="rounded-full px-2 py-1 text-lg hover:bg-purple-100"
        >
          {reaction}
        </button>
      ))}
    </div>
  );
}