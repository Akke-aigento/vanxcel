// Teksten die in Akke Insights met "Ja, pas aan" goedgekeurd zijn (titel en beschrijving per
// pagina), de bedrijfsgegevens (JSON-LD voor de homepage) en goedgekeurde gidspagina's uit de
// contentmotor (/gids/<slug>). De SEO-plugin haalt alles op bij elke build en geeft teksten en
// gidspagina's via __SEO_OVERRIDES__ / __SEO_CONTENT__ ook aan de browser. Is Insights
// onbereikbaar, dan blijft alles bij de teksten in deze repo: een build mag hier nooit op falen.
export const INSIGHTS_SEO_URL = "https://insights.studioakke.com/api/seo/d6htriawzhuw";

export type SeoOverrides = Record<string, { title?: string; description?: string }>;
export type GuidePage = {
  slug: string;
  lang: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { kop: string; tekst: string }[];
  faq: { vraag: string; antwoord: string }[];
  cta_label: string | null;
  cta_href: string | null;
};

declare const __SEO_OVERRIDES__: SeoOverrides | undefined;
declare const __SEO_CONTENT__: GuidePage[] | undefined;

/** In de browser: wat de build meegaf. In de plugin (Node): leeg; die gebruikt fetchSeoBundle. */
export const SEO_OVERRIDES: SeoOverrides =
  typeof __SEO_OVERRIDES__ !== "undefined" ? __SEO_OVERRIDES__ : {};
export const SEO_CONTENT: GuidePage[] =
  typeof __SEO_CONTENT__ !== "undefined" ? __SEO_CONTENT__ : [];

export const guideFor = (slug: string | undefined) => SEO_CONTENT.find((g) => g.slug === slug);

export function normSeoPath(p: string): string {
  const clean = p.split(/[?#]/)[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
}

export function overrideFor(path: string, overrides: SeoOverrides = SEO_OVERRIDES) {
  const o = overrides[normSeoPath(path)];
  if (o) return o;
  const m = /^\/gids\/([^/]+)$/.exec(normSeoPath(path));
  const g = m ? guideFor(m[1]) : undefined;
  return g ? { title: g.title, description: g.description } : undefined;
}

/** Past een goedgekeurde tekst toe op een pagina-object met title/description. */
export function withOverride<T extends { path: string; title: string; description: string }>(
  page: T,
  overrides: SeoOverrides = SEO_OVERRIDES,
): T {
  const o = overrides[normSeoPath(page.path)];
  if (!o) return page;
  return { ...page, title: o.title ?? page.title, description: o.description ?? page.description };
}

export type SeoBundle = {
  pages: SeoOverrides;
  jsonld: Record<string, unknown> | null;
  content: GuidePage[];
};

/** Alles uit Insights in één keer. */
export async function fetchSeoBundle(): Promise<SeoBundle> {
  try {
    const res = await fetch(INSIGHTS_SEO_URL, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return { pages: {}, jsonld: null, content: [] };
    const json = (await res.json()) as Partial<SeoBundle>;
    return {
      pages: json.pages && typeof json.pages === "object" ? json.pages : {},
      jsonld: json.jsonld && typeof json.jsonld === "object" ? json.jsonld : null,
      content: Array.isArray(json.content)
        ? json.content.filter((g) => g && /^[a-z0-9-]+$/.test(g.slug))
        : [],
    };
  } catch {
    return { pages: {}, jsonld: null, content: [] };
  }
}

export async function fetchSeoOverrides(): Promise<SeoOverrides> {
  return (await fetchSeoBundle()).pages;
}

/** FAQPage-gegevens voor een gidspagina (de vragen staan zichtbaar op de pagina). */
export function guideJsonLd(g: GuidePage, url: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  if (g.faq.length)
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faq.map((f) => ({
        "@type": "Question",
        name: f.vraag,
        acceptedAnswer: { "@type": "Answer", text: f.antwoord },
      })),
    });
  out.push({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.description,
    inLanguage: g.lang,
    mainEntityOfPage: url,
  });
  return out;
}
