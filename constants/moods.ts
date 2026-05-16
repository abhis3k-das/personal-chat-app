export const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "stressed", label: "Stressed", emoji: "😵‍💫" },
  { value: "missing_you", label: "Missing you", emoji: "🥺" },
  { value: "excited", label: "Excited", emoji: "🤩" },
];

export type MoodValue = (typeof MOODS)[number]["value"];