export type ThemeId =
  | "lilac"
  | "lavender"
  | "violet"
  | "amethyst"
  | "orchid"
  | "plum"
  | "mauve"
  | "wine"
  | "royal"
  | "white"
  | "babyPink"
  | "butterYellow"
  | "iceBlue"
  | "sageGreen"
  | "black";

export const DEFAULT_THEME_ID: ThemeId = "violet";

export const THEMES = {
  lilac: {
    id: "lilac",
    name: "Lilac Bloom",
    background: "from-purple-100 via-fuchsia-100 to-pink-100",
    primary: "bg-purple-400",
    primaryHover: "hover:bg-purple-500",
    text: "text-purple-700",
    soft: "bg-purple-100",
    border: "border-purple-200",
  },

  lavender: {
    id: "lavender",
    name: "Lavender Mist",
    background: "from-violet-100 via-purple-100 to-slate-100",
    primary: "bg-violet-400",
    primaryHover: "hover:bg-violet-500",
    text: "text-violet-700",
    soft: "bg-violet-100",
    border: "border-violet-200",
  },

  violet: {
    id: "violet",
    name: "Violet Dream",
    background: "from-violet-100 via-purple-100 to-indigo-100",
    primary: "bg-violet-500",
    primaryHover: "hover:bg-violet-600",
    text: "text-violet-700",
    soft: "bg-violet-100",
    border: "border-violet-200",
  },

  amethyst: {
    id: "amethyst",
    name: "Amethyst Glow",
    background: "from-purple-200 via-violet-100 to-fuchsia-100",
    primary: "bg-purple-600",
    primaryHover: "hover:bg-purple-700",
    text: "text-purple-800",
    soft: "bg-purple-100",
    border: "border-purple-300",
  },

  orchid: {
    id: "orchid",
    name: "Orchid Kiss",
    background: "from-fuchsia-100 via-purple-100 to-pink-100",
    primary: "bg-fuchsia-500",
    primaryHover: "hover:bg-fuchsia-600",
    text: "text-fuchsia-700",
    soft: "bg-fuchsia-100",
    border: "border-fuchsia-200",
  },

  plum: {
    id: "plum",
    name: "Plum Velvet",
    background: "from-purple-200 via-fuchsia-100 to-rose-100",
    primary: "bg-purple-700",
    primaryHover: "hover:bg-purple-800",
    text: "text-purple-900",
    soft: "bg-purple-100",
    border: "border-purple-300",
  },

  mauve: {
    id: "mauve",
    name: "Mauve Soft",
    background: "from-pink-100 via-purple-100 to-violet-100",
    primary: "bg-pink-400",
    primaryHover: "hover:bg-pink-500",
    text: "text-pink-700",
    soft: "bg-pink-100",
    border: "border-pink-200",
  },

  wine: {
    id: "wine",
    name: "Wine Romance",
    background: "from-rose-100 via-fuchsia-100 to-purple-200",
    primary: "bg-fuchsia-700",
    primaryHover: "hover:bg-fuchsia-800",
    text: "text-fuchsia-800",
    soft: "bg-fuchsia-100",
    border: "border-fuchsia-200",
  },

  royal: {
    id: "royal",
    name: "Royal Purple",
    background: "from-indigo-100 via-purple-100 to-violet-100",
    primary: "bg-indigo-600",
    primaryHover: "hover:bg-indigo-700",
    text: "text-indigo-800",
    soft: "bg-indigo-100",
    border: "border-indigo-200",
  },

  white: {
    id: "white",
    name: "Soft White",
    background: "from-white via-slate-50 to-gray-100",
    primary: "bg-gray-800",
    primaryHover: "hover:bg-gray-900",
    text: "text-gray-800",
    soft: "bg-gray-100",
    border: "border-gray-200",
  },

  babyPink: {
    id: "babyPink",
    name: "Baby Pink",
    background: "from-pink-50 via-rose-50 to-pink-100",
    primary: "bg-pink-300",
    primaryHover: "hover:bg-pink-400",
    text: "text-pink-600",
    soft: "bg-pink-50",
    border: "border-pink-200",
  },

  butterYellow: {
    id: "butterYellow",
    name: "Butter Yellow",
    background: "from-yellow-50 via-amber-50 to-orange-100",
    primary: "bg-yellow-400",
    primaryHover: "hover:bg-yellow-500",
    text: "text-yellow-700",
    soft: "bg-yellow-100",
    border: "border-yellow-200",
  },

  iceBlue: {
    id: "iceBlue",
    name: "Ice Blue",
    background: "from-sky-50 via-cyan-50 to-blue-100",
    primary: "bg-sky-400",
    primaryHover: "hover:bg-sky-500",
    text: "text-sky-700",
    soft: "bg-sky-100",
    border: "border-sky-200",
  },

  sageGreen: {
    id: "sageGreen",
    name: "Sage Green",
    background: "from-green-50 via-emerald-50 to-lime-100",
    primary: "bg-emerald-400",
    primaryHover: "hover:bg-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-100",
    border: "border-emerald-200",
  },

  black: {
    id: "black",
    name: "Midnight Black",
    background: "from-gray-950 via-purple-950 to-black",
    primary: "bg-purple-700",
    primaryHover: "hover:bg-purple-800",
    text: "text-purple-200",
    soft: "bg-gray-900",
    border: "border-purple-900",
  },
} as const;