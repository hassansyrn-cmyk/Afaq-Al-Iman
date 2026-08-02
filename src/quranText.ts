/**
 * Display-only normalization for the Quran text.
 *
 * The bundled Tanzil "Uthmani" text uses a small number of rare Quranic annotation
 * marks that are not covered by the self-hosted Amiri Quran subset (or, in the case of
 * U+065E, by any commonly available Quran font at the time of writing — this was
 * verified directly against the official upstream AmiriQuran.ttf, which also lacks a
 * glyph for it). Rendering an unsupported codepoint shows up as a tofu box.
 *
 * This function substitutes those specific codepoints with their standard, universally
 * supported visual equivalent *only for on-screen rendering*. It never touches the
 * stored JSON files under /public/quran — the original Tanzil text stays untouched on
 * disk; only the rendered string passed through this function is adjusted.
 *
 * Known substitutions:
 * - U+065E (ARABIC FATHA WITH TWO DOTS) -> U+064C (ARABIC DAMMATAN)
 *   Tanzil's Uthmani encoding uses U+065E as a stylistic variant of tanween damm in a
 *   handful of words (e.g. شَيْءٌ). It is visually a dammatan and reads identically;
 *   no font available to this project renders the two-dot variant distinctly, so the
 *   standard dammatan glyph is the correct fallback.
 * - U+2009 (THIN SPACE) -> U+0020 (regular space)
 *   A single incidental occurrence in the dataset; not part of the Arabic script range
 *   the bundled font subsets cover.
 */
const DISPLAY_SUBSTITUTIONS: Record<string, string> = {
  "\u065E": "\u064C",
  "\u2009": " ",
};

const PATTERN = new RegExp(Object.keys(DISPLAY_SUBSTITUTIONS).join("|"), "g");

export function sanitizeQuranText(text: string): string {
  if (!text) return text;
  return text.replace(PATTERN, (ch) => DISPLAY_SUBSTITUTIONS[ch] ?? ch);
}
