// Country metadata for the customer directory. Codes match customers/constants.ts.
export const COUNTRY_NAME: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  SG: "Singapore",
  ID: "Indonesia",
  AU: "Australia",
  CA: "Canada",
  FR: "France",
  NL: "Netherlands",
  JP: "Japan",
  IN: "India",
  BR: "Brazil",
};

// Turn a 2-letter ISO code into its flag emoji via regional-indicator symbols.
// Renders as a flag on macOS / iOS / Android / Linux; degrades to the letters
// on platforms without flag glyphs (Windows), which is still legible.
export function flagEmoji(code: string) {
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return "";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 127397 + ch.charCodeAt(0)),
  );
}

export function countryName(code: string) {
  return COUNTRY_NAME[code.trim().toUpperCase()] ?? code;
}
