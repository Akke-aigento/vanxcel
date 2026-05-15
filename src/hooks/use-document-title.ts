import { useEffect } from "react";

const BASE = "VanXcel";

// Canonical regional sites — used for hreflang alternates and as
// the canonical host fallback. Order matters for x-default (last wins not — see below).
const REGION_SITES: { hreflang: string; url: string }[] = [
  { hreflang: "nl-BE", url: "https://vanxcel.be" },
  { hreflang: "nl-NL", url: "https://vanxcel.nl" },
  { hreflang: "en", url: "https://vanxcel.com" },
];
const X_DEFAULT_URL = "https://vanxcel.com";

// Per-hostname canonical: each domain canonicalizes to itself so Google
// keeps regional versions as separate, indexable URLs (joined via hreflang).
function getCanonicalSiteUrl(): string {
  if (typeof window === "undefined") return "https://vanxcel.be";
  const host = window.location.hostname;
  if (host.endsWith("vanxcel.nl")) return "https://vanxcel.nl";
  if (host.endsWith("vanxcel.com")) return "https://vanxcel.com";
  if (host.endsWith("vanxcel.be")) return "https://vanxcel.be";
  // Preview / lovable.app etc → fall back to .be canonical to avoid duplicates
  return "https://vanxcel.be";
}

const DEFAULT_TITLE = `${BASE} — Power Your Journey | Off-Grid Campervan Systemen`;
const DEFAULT_DESC =
  "VanXcel — LiFePO4 batterijen, converters & off-grid systemen voor campervans. Belgisch merk met 2 jaar garantie.";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bcfcec1c-2cb6-4d9e-81f6-00ca7d66bf56/id-preview-ce007984--80408260-c0d8-4f90-a4c4-58c9202792e0.lovable.app-1773483802478.png";

interface SEOOptions {
  description?: string;
  image?: string;
  type?: string; // og:type, e.g. "website", "product", "article"
  path?: string; // override path; defaults to current location
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsert<T extends HTMLElement>(
  selector: string,
  attr: string,
  value: string,
  factory: () => T,
) {
  let el = document.head.querySelector(selector) as T | null;
  if (!el) {
    el = factory();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Sets <title>, meta description, canonical, og:title/description/url/image/type,
 * and hreflang alternates for the current route. Pass description+path for
 * proper per-route SEO.
 *
 * Backwards-compatible: existing callers that pass only `title` still work.
 */
export function useDocumentTitle(title?: string, options: SEOOptions = {}) {
  const { description, image, type = "website", path, jsonLd } = options;

  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMAGE;
    const routePath =
      path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const siteUrl = getCanonicalSiteUrl();
    const url = `${siteUrl}${routePath}`;

    document.title = fullTitle;

    upsert('meta[name="description"]', "content", desc, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    });
    upsert('link[rel="canonical"]', "href", url, () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    upsert('meta[property="og:title"]', "content", fullTitle, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:title");
      return m;
    });
    upsert('meta[property="og:description"]', "content", desc, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:description");
      return m;
    });
    upsert('meta[property="og:url"]', "content", url, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:url");
      return m;
    });
    upsert('meta[property="og:type"]', "content", type, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:type");
      return m;
    });
    upsert('meta[property="og:image"]', "content", img, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image");
      return m;
    });
    upsert('meta[name="twitter:title"]', "content", fullTitle, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:title");
      return m;
    });
    upsert('meta[name="twitter:description"]', "content", desc, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:description");
      return m;
    });
    upsert('meta[name="twitter:image"]', "content", img, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:image");
      return m;
    });

    // Hreflang alternates: tell Google these regional URLs are variants
    // of the same page so they don't compete as duplicate content.
    // Strategy: remove any existing hreflang links we own, then re-add
    // a fresh set for this route.
    const existingAlternates = document.head.querySelectorAll(
      'link[rel="alternate"][data-hreflang="true"]',
    );
    existingAlternates.forEach((el) => el.parentNode?.removeChild(el));

    const addAlternate = (hreflang: string, href: string) => {
      const l = document.createElement("link");
      l.setAttribute("rel", "alternate");
      l.setAttribute("hreflang", hreflang);
      l.setAttribute("href", href);
      l.setAttribute("data-hreflang", "true");
      document.head.appendChild(l);
    };

    REGION_SITES.forEach((s) => addAlternate(s.hreflang, `${s.url}${routePath}`));
    addAlternate("x-default", `${X_DEFAULT_URL}${routePath}`);

    // JSON-LD: managed via a dedicated tag we own, removed on unmount.
    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.dataset.routeJsonld = "true";
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      // restore defaults so the next route doesn't inherit stale values
      document.title = DEFAULT_TITLE;
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      // hreflang alternates are replaced on next mount; safe to leave in place
    };
  }, [title, description, image, type, path, JSON.stringify(jsonLd ?? null)]);
}

/** Convenience alias used by newer pages. */
export const useSEO = useDocumentTitle;
