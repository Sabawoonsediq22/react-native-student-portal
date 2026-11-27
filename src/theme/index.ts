/**
 * Semantic token names available as NativeWind utilities.
 * Their values live only in ../../global.css.
 */
export const colorTokenNames = [
  "background",
  "foreground",
  "card",
  "border",
  "primary",
  "on-primary",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "input",
  "destructive",
  "success",
  "warning",
  "info",
  "sidebar",
  "popover",
  "brand-ink",
] as const;

export type ColorTokenName = (typeof colorTokenNames)[number];
export type ThemeMode = "light" | "dark";

/** Font family configured in global.css; load its font asset before using it. */
export const fontFamilyName = "Inter" as const;
