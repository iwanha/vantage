// Helpers for crafted table cells — avatars, monogram tiles, category chips.
import type { CSSProperties } from "react";

// Two-letter initials from a person's name ("Ada Lovelace" → "AL").
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Deterministic hue (0–359) from an arbitrary string, so the same name always
// maps to the same tint across renders.
export function hueFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

// Fixed per-category hues so the catalog reads as a consistent legend.
const CATEGORY_HUE: Record<string, number> = {
  Apparel: 340,
  Electronics: 255,
  Home: 155,
  Beauty: 315,
  Sports: 25,
  Toys: 50,
  Grocery: 135,
  Books: 210,
};

export function categoryHue(category: string) {
  return CATEGORY_HUE[category] ?? hueFromString(category);
}

// A translucent tint keyed to a hue — the background floats over whatever card
// colour sits behind it, so a single value works in both light and dark themes.
export function hueTint(hue: number): CSSProperties {
  return {
    color: `oklch(0.62 0.17 ${hue})`,
    background: `oklch(0.62 0.17 ${hue} / 0.14)`,
  };
}
