export type ThemeId = "rose" | "purple" | "peach";

export const THEMES = {
  rose: {
    id: "rose",
    name: "Rose Love",
    background: "from-pink-100 via-rose-100 to-red-100",
    primary: "bg-pink-500",
    primaryHover: "hover:bg-pink-600",
    text: "text-pink-700",
    soft: "bg-pink-100",
    border: "border-pink-200",
  },
  purple: {
    id: "purple",
    name: "Purple Dream",
    background: "from-purple-100 via-violet-100 to-fuchsia-100",
    primary: "bg-purple-500",
    primaryHover: "hover:bg-purple-600",
    text: "text-purple-700",
    soft: "bg-purple-100",
    border: "border-purple-200",
  },
  peach: {
    id: "peach",
    name: "Peach Glow",
    background: "from-orange-100 via-pink-100 to-yellow-100",
    primary: "bg-orange-400",
    primaryHover: "hover:bg-orange-500",
    text: "text-orange-700",
    soft: "bg-orange-100",
    border: "border-orange-200",
  },
} as const;