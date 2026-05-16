"use client";

import { MOODS } from "@/constants/moods";

interface MoodSelectorProps {
  selectedMood?: string;
  onSelectMood: (mood: {
    value: string;
    label: string;
    emoji: string;
  }) => void;
}

export default function MoodSelector({
  selectedMood,
  onSelectMood,
}: MoodSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.value;

        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onSelectMood(mood)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${
              isSelected
                ? "bg-purple-500 text-white shadow-md"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            {mood.emoji} {mood.label}
          </button>
        );
      })}
    </div>
  );
}