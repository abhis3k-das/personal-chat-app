"use client";

import { DisplayDateEvent } from "@/lib/dateEvents";

interface DateReminderWidgetProps {
  events: DisplayDateEvent[];
}

function getEventLabel(event: DisplayDateEvent) {
  if (event.daysRemaining === 0) {
    return `Today: ${event.title}`;
  }

  if (event.daysRemaining === 1) {
    return `Tomorrow: ${event.title}`;
  }

  return `${event.daysRemaining} days until ${event.title}`;
}

export default function DateReminderWidget({ events }: DateReminderWidgetProps) {
  if (events.length === 0) return null;

  if (events.length === 1) {
    const event = events[0];

    return (
      <div className="rounded-xl bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700">
        {getEventLabel(event)} {event.type === "important" ? "❤️" : "💕"}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700">
      {events[0].daysRemaining === 0
        ? "Today"
        : `${events[0].daysRemaining} days left`}
      :{" "}
      {events.map((event) => event.title).join(" + ")} 💕
    </div>
  );
}