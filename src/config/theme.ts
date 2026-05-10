/**
 * Theme config — mirrors the CSS variables in src/styles/themes/*.css
 *
 * Use this file when you need theme values in TypeScript (e.g. chart colours,
 * inline styles, canvas drawing). For Tailwind utilities just use the generated
 * classes (bg-primary-500, text-accent-600, etc.) which come from globals.css.
 */

export const themes = {
  default: {
    name: "Default",
    description: "Clean blue — professional and trustworthy",
    primaryHue: 250,
    accentHue: 55,
  },
  midnight: {
    name: "Midnight",
    description: "Dark luxury — teal on dark for high-end feel",
    primaryHue: 170,
    accentHue: 45,
  },
  sport: {
    name: "Sport",
    description: "Bold red — energetic and performance-focused",
    primaryHue: 20,
    accentHue: 55,
  },
} as const;

export type ThemeName = keyof typeof themes;

/** Semantic colour roles used across the app */
export const colorRoles = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

export type ColorRole = (typeof colorRoles)[number];

/** Border radius tokens — keep in sync with the active theme CSS file */
export const radius = {
  sm: "var(--brand-radius-sm)",
  md: "var(--brand-radius-md)",
  lg: "var(--brand-radius-lg)",
  xl: "var(--brand-radius-xl)",
  full: "var(--brand-radius-full)",
} as const;
