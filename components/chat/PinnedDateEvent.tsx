"use client";

import { DisplayDateEvent } from "@/lib/dateEvents";

interface PinnedDateEventProps {
  events: DisplayDateEvent[];
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function getTypeIcon(type: DisplayDateEvent["type"]) {
  return type === "important" ? "❤️" : "💕";
}

export default function PinnedDateEvent({ events }: PinnedDateEventProps) {
  if (events.length === 0) return null;

  const sortedEvents = [...events].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );

  const firstEvent = sortedEvents[0];
  const extraCount = sortedEvents.length - 1;

  return (
    <div className="border-b border-purple-100 bg-white px-4 py-2 sm:px-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-purple-50 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-purple-700">
            {firstEvent.title} {getTypeIcon(firstEvent.type)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {extraCount > 0 && (
            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-purple-700">
              +{extraCount} more
            </span>
          )}

          <span className="text-sm font-semibold text-gray-500">
            {formatDisplayDate(firstEvent.nextDate)}
          </span>
        </div>
      </div>
    </div>
  );
}