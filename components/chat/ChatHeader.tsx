"use client";

import { useState } from "react";
import Link from "next/link";
import DateReminderWidget from "@/components/countdown/DateReminderWidget";
import { MOODS } from "@/constants/moods";
import { DisplayDateEvent } from "@/lib/dateEvents";

interface MoodData {
  mood: string;
  label: string;
  emoji: string;
}

interface ChatHeaderProps {
  partnerName?: string;
  partnerMood?: MoodData | null;
  currentUserMood?: MoodData | null;
  dateEvents?: DisplayDateEvent[];
  isPartnerOnline?: boolean;
  partnerLastSeen?: any;
  onSelectMood: (mood: {
    value: string;
    label: string;
    emoji: string;
  }) => void;
  onLogout: () => void;
}

function formatLastSeen(lastSeen: any) {
  if (!lastSeen?.toDate) return "Last seen unavailable";

  return `Last seen ${lastSeen.toDate().toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function ChatHeader({
  partnerName = "Partner",
  partnerMood,
  currentUserMood,
  dateEvents = [],
  isPartnerOnline = false,
  partnerLastSeen,
  onSelectMood,
  onLogout,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const partnerInitial = partnerName.charAt(0).toUpperCase();

  const handleMoodSelect = (mood: {
    value: string;
    label: string;
    emoji: string;
  }) => {
    onSelectMood(mood);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative z-40 border-b border-purple-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-lg font-bold text-white shadow-md">
            {partnerInitial}
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-lg font-bold leading-tight text-purple-800">
                {partnerName}
              </h1>

              {partnerMood && (
                <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                  {partnerMood.emoji} {partnerMood.label}
                </span>
              )}
            </div>

            <p
              className={`mt-0.5 text-xs font-semibold ${
                isPartnerOnline ? "text-green-600" : "text-gray-400"
              }`}
            >
              {isPartnerOnline ? "Online now" : formatLastSeen(partnerLastSeen)}
            </p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-lg font-bold text-purple-700 shadow-sm hover:bg-purple-100"
            title="Open profile menu"
          >
            ⋯
          </button>

          {isMenuOpen && (
            <>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close menu"
              />

              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-purple-100">
                <div className="border-b border-purple-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Your mood
                  </p>

                  <p className="mt-1 text-sm font-bold text-purple-700">
                    {currentUserMood
                      ? `${currentUserMood.emoji} ${currentUserMood.label}`
                      : "No mood selected"}
                  </p>
                </div>

                <div className="border-b border-purple-50 p-2">
                  {MOODS.map((mood) => {
                    const isSelected = currentUserMood?.mood === mood.value;

                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-purple-50 ${
                          isSelected
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span>
                          {mood.emoji} {mood.label}
                        </span>

                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2">
                  <Link
                    href="/love-notes"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
                  >
                    💌 Love Notes
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
                  >
                    ⚙️ Settings
                  </Link>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {dateEvents.length > 0 && (
        <div className="mt-3">
          <DateReminderWidget events={dateEvents} />
        </div>
      )}
    </header>
  );
}