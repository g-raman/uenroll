export const INITIAL_COLOURS = [
  "text-black border-l-red-400 bg-red-300",
  "text-black border-l-sky-500 bg-sky-300",
  "text-black border-l-lime-400 bg-lime-200",
  "text-black border-l-yellow-400 bg-yellow-200",
  "text-black border-l-amber-500 bg-amber-300",
  "text-black border-l-emerald-800 bg-emerald-400",
  "text-black border-l-indigo-800 bg-indigo-400",
  "text-black border-l-pink-500 bg-pink-300",
  "text-black border-l-violet-600 bg-violet-300",
  "text-black border-l-orange-500 bg-orange-300",
  "text-black border-l-blue-500 bg-blue-300",
];

// Explicity defined to let Tailwind compiler know to include these in CSS bundle
export const BG_COLOURS = [
  "bg-red-300/50",
  "bg-sky-300/50",
  "bg-lime-200/50",
  "bg-yellow-200/50",
  "bg-amber-300/50",
  "bg-emerald-400/50",
  "bg-indigo-400/50",
  "bg-pink-300/50",
  "bg-violet-300/50",
  "bg-orange-300/50",
  "bg-blue-300/50",
];

export const MAX_RESULTS_ALLOWED = INITIAL_COLOURS.length;

export const STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const GC_TIME = 1000 * 60 * 10; // 10 minutes

export const dayOfWeekToNumberMap: { [key: string]: number } = {
  "N/A": -1,
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
  Su: 7,
};

export const TIMEZONE = "America/Toronto";
