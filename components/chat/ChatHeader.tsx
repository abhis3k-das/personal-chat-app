"use client";

import { useState } from "react";
import Link from "next/link";
import DateReminderWidget from "@/components/countdown/DateReminderWidget";
import { MOODS } from "@/constants/moods";
import { DisplayDateEvent } from "@/lib/dateEvents";
import { DEFAULT_THEME_ID, THEMES, ThemeId } from "@/constants/themes";

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
  partnerPhotoURL?: string;
  themeId?: ThemeId;
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
  partnerPhotoURL,
  themeId = DEFAULT_THEME_ID,
  onSelectMood,
  onLogout,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedTheme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
  const isDarkTheme = themeId === "black";

  const displayPartnerName = partnerName.trim() || "Partner";
  const partnerInitial = displayPartnerName.charAt(0).toUpperCase();

  const handleMoodSelect = (mood: {
    value: string;
    label: string;
    emoji: string;
  }) => {
    onSelectMood(mood);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`relative z-40 border-b px-4 py-3 backdrop-blur sm:px-5 ${
        isDarkTheme
          ? "border-purple-900 bg-black/85"
          : `${selectedTheme.border} bg-white/90`
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${selectedTheme.primary} text-lg font-bold text-white shadow-md`}
          >
            {partnerPhotoURL ? (
              <img
                src={partnerPhotoURL}
                alt={displayPartnerName}
                className="h-full w-full object-cover"
              />
            ) : (
              partnerInitial
            )}
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1
                className={`truncate text-lg font-bold leading-tight ${
                  isDarkTheme ? "text-purple-100" : selectedTheme.text
                }`}
              >
                {displayPartnerName}
              </h1>

              {partnerMood && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isDarkTheme
                      ? "bg-purple-950 text-purple-200"
                      : `${selectedTheme.soft} ${selectedTheme.text}`
                  }`}
                >
                  {partnerMood.emoji} {partnerMood.label}
                </span>
              )}
            </div>

            <p
              className={`mt-0.5 text-xs font-semibold ${
                isPartnerOnline
                  ? "text-green-600"
                  : isDarkTheme
                  ? "text-gray-400"
                  : "text-gray-400"
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
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-sm ${
              isDarkTheme
                ? "bg-purple-950 text-purple-200 hover:bg-purple-900"
                : `${selectedTheme.soft} ${selectedTheme.text} hover:opacity-80`
            }`}
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

              <div
                className={`absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl shadow-2xl ring-1 ${
                  isDarkTheme
                    ? "bg-gray-950 ring-purple-900"
                    : `bg-white ${selectedTheme.border}`
                }`}
              >
                <div
                  className={`border-b px-4 py-3 ${
                    isDarkTheme ? "border-purple-900" : selectedTheme.border
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${
                      isDarkTheme ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Your mood
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold ${
                      isDarkTheme ? "text-purple-200" : selectedTheme.text
                    }`}
                  >
                    {currentUserMood
                      ? `${currentUserMood.emoji} ${currentUserMood.label}`
                      : "No mood selected"}
                  </p>
                </div>

                <div
                  className={`border-b p-2 ${
                    isDarkTheme ? "border-purple-900" : selectedTheme.border
                  }`}
                >
                  {MOODS.map((mood) => {
                    const isSelected = currentUserMood?.mood === mood.value;

                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                          isDarkTheme
                            ? isSelected
                              ? "bg-purple-950 text-purple-200"
                              : "text-gray-300 hover:bg-gray-900"
                            : isSelected
                            ? `${selectedTheme.soft} ${selectedTheme.text}`
                            : `text-gray-700 hover:${selectedTheme.soft}`
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
                    className={`block rounded-xl px-3 py-2 text-sm font-bold ${
                      isDarkTheme
                        ? "text-purple-200 hover:bg-gray-900"
                        : `${selectedTheme.text} hover:bg-gray-50`
                    }`}
                  >
                    💌 Love Notes
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm font-bold ${
                      isDarkTheme
                        ? "text-purple-200 hover:bg-gray-900"
                        : `${selectedTheme.text} hover:bg-gray-50`
                    }`}
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