/** ISO-2 country codes (no hardcoded names — names come from Intl.DisplayNames). */
export const ALL_COUNTRY_CODES = [
  "BE", "NL", "DE", "FR", "LU", "AT", "CH", "GB", "ES", "IT", "PT", "DK",
  "SE", "NO", "PL", "CZ", "IE", "FI", "GR", "HR", "SI", "SK", "HU", "RO", "BG",
];

/** Flag emoji derived from the ISO-2 code (regional indicator letters). */
export function countryFlag(code: string): string {
  const cc = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

function displayNames(locale: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([locale, "nl"], { type: "region" });
  } catch {
    try {
      return new Intl.DisplayNames(["nl"], { type: "region" });
    } catch {
      return null;
    }
  }
}

export function countryName(code: string, locale = "nl"): string {
  const cc = (code || "").trim().toUpperCase();
  if (!cc) return "";
  const dn = displayNames(locale);
  try {
    return dn?.of(cc) || cc;
  } catch {
    return cc;
  }
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

/** Localized, alphabetically sorted country options for the given ISO-2 codes. */
export function localizedCountryOptions(codes: string[], locale = "nl"): CountryOption[] {
  const seen = new Set<string>();
  const options: CountryOption[] = [];
  for (const raw of codes || []) {
    const cc = (raw || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc) || seen.has(cc)) continue;
    seen.add(cc);
    options.push({ code: cc, name: countryName(cc, locale), flag: countryFlag(cc) });
  }
  const collator = new Intl.Collator(locale || "nl");
  return options.sort((a, b) => collator.compare(a.name, b.name));
}
