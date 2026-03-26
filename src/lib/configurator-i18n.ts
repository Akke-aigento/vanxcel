/**
 * Get a localized field from a database row.
 * Tries `field_XX` for the current language, falls back to the base field.
 * For Dutch: tries `field` directly (Dutch is the base language in our DB).
 * For English: tries `field_en` → `field`.
 * For German: tries `field_de` → `field`.
 * For French: tries `field_fr` → `field`.
 */
export function getLocalized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  lang: string
): string {
  if (lang === "nl") {
    // Dutch is the base language — try field_nl first (for appliances name_nl), then field
    const nlKey = `${field}_nl` as keyof T;
    if (row[nlKey] && typeof row[nlKey] === "string") return row[nlKey] as string;
    return (row[field as keyof T] as string) ?? "";
  }

  // For other languages, try the suffixed version first
  const localizedKey = `${field}_${lang}` as keyof T;
  if (row[localizedKey] && typeof row[localizedKey] === "string") {
    return row[localizedKey] as string;
  }

  // Fallback: try English
  if (lang !== "en") {
    const enKey = `${field}_en` as keyof T;
    if (row[enKey] && typeof row[enKey] === "string") return row[enKey] as string;
  }

  // Final fallback: base field (Dutch)
  const nlKey = `${field}_nl` as keyof T;
  if (row[nlKey] && typeof row[nlKey] === "string") return row[nlKey] as string;
  return (row[field as keyof T] as string) ?? "";
}

/**
 * Get the current i18n language code (2 chars).
 */
export function getLangFromI18n(i18nLanguage: string): string {
  return i18nLanguage?.substring(0, 2) ?? "nl";
}
