export type DateEventType = "important" | "upcoming";

export interface DateEvent {
  id: string;
  title: string;
  notes: string;
  date: string; // YYYY-MM-DD
  type: DateEventType;
  createdAt: any;
  updatedAt?: any;
}