export const INITIAL_COLOURS = [
  "bg-red-300 text-black border-l-red-400",
  "bg-sky-300 text-black border-l-sky-500",
  "bg-lime-200 text-black border-l-lime-400",
  "bg-yellow-200 text-black border-l-yellow-400",
  "bg-amber-300 text-black border-l-amber-500",
  "bg-emerald-400 text-black border-l-emerald-800",
  "bg-indigo-400 text-black border-l-indigo-800",
  "bg-pink-300 text-black border-l-pink-500",
  "bg-violet-300 text-black border-l-violet-600",
  "bg-orange-300 text-black border-l-orange-500",
  "bg-blue-300 text-black border-l-blue-500",
]

export const MAX_RESULTS_ALLOWED = INITIAL_COLOURS.length

export const dayOfWeekToNumberMap: { [key: string]: number } = {
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
  Su: 7,
}

export const BASE_URL = "https://uenroll.ca"
