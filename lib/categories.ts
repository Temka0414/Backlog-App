export const CATEGORIES = {
  "pirated-aaa": {
    label: "Pirated-AAA Games",
    color: "blue",
  },
  "pirated-indieaa": {
    label: "Pirated-Indie / AA Games",
    color: "purple",
  },
  "played-legit": {
    label: "Played Legit (Not-owned on Steam)",
    color: "green",
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;