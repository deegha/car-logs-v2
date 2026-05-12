export const BODY_TYPES = [
  "SUV / 4x4",
  "Hatchback",
  "Saloon",
  "Station wagon",
  "MPV",
  "Coupé/Sports",
  "Convertible",
] as const;

export type BodyType = (typeof BODY_TYPES)[number];

export const BODY_TYPE_OPTIONS = BODY_TYPES.map((t) => ({ value: t, label: t }));
