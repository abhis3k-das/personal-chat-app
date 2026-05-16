import { DateEvent } from "@/types/date-event";

export interface DisplayDateEvent {
  id: string;
  title: string;
  notes: string;
  type: "important" | "upcoming";
  originalDate: string;
  nextDate: Date;
  daysRemaining: number;
}

function toStartOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getDaysDiff(fromDate: Date, toDate: Date) {
  const from = toStartOfDay(fromDate);
  const to = toStartOfDay(toDate);

  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextImportantDate(dateString: string, today: Date) {
  const originalDate = new Date(dateString);

  const month = originalDate.getMonth();
  const day = originalDate.getDate();

  let nextDate = new Date(today.getFullYear(), month, day);
  nextDate = toStartOfDay(nextDate);

  if (nextDate < toStartOfDay(today)) {
    nextDate = new Date(today.getFullYear() + 1, month, day);
  }

  return nextDate;
}

function getNextUpcomingDate(dateString: string) {
  return toStartOfDay(new Date(dateString));
}

export function getVisibleDateEvents(events: DateEvent[]) {
  const today = toStartOfDay(new Date());

  const mappedEvents: DisplayDateEvent[] = events
    .map((event) => {
      const nextDate =
        event.type === "important"
          ? getNextImportantDate(event.date, today)
          : getNextUpcomingDate(event.date);

      const daysRemaining = getDaysDiff(today, nextDate);

      return {
        id: event.id,
        title: event.title,
        notes: event.notes,
        type: event.type,
        originalDate: event.date,
        nextDate,
        daysRemaining,
      };
    })
    .filter((event) => {
      if (event.type === "important") return true;

      return event.daysRemaining >= 0;
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nearestUpcoming = mappedEvents.find(
    (event) => event.type === "upcoming"
  );

  const nearestImportant = mappedEvents.find(
    (event) => event.type === "important"
  );

  return [nearestUpcoming, nearestImportant].filter(
    Boolean
  ) as DisplayDateEvent[];
}