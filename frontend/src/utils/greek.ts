// Monotonic Greek typography rule: when a word is displayed in ALL CAPS,
// the tonos (accent) is dropped, e.g. "Υπηρεσίες" -> "ΥΠΗΡΕΣΙΕΣ".
// The dialytika (¨) is kept. Latin text passes through unaffected.
const GREEK_ACCENTS = /[\u0300\u0301\u0313\u0314\u0342\u0343\u0345]/g;

export function stripGreekAccents(input: string): string {
  return input.normalize("NFD").replace(GREEK_ACCENTS, "").normalize("NFC");
}

// Uppercase a string and strip Greek accents (for all-caps labels/eyebrows).
export function capsGreek(input: string): string {
  return stripGreekAccents(input.toUpperCase());
}
