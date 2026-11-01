export const activities = [
  "breathing",
  "grounding",
  "journal",
  "steps",
] as const;
export type Activity = (typeof activities)[number];
