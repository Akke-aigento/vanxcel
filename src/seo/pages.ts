// Eén bron voor titel en beschrijving van de vaste pagina's (nl). Gebruikt door de Vite-plugin
// seo-pages-plugin.ts, die bij de build per route een eigen HTML-bestand schrijft. Zo ziet een
// crawler of deelplatform zonder JavaScript per pagina een eigen titel, beschrijving en de
// hreflang-varianten. Na het laden neemt useDocumentTitle het over (taal + canonical per domein).
//
// Canonical in de statische HTML is RELATIEF (href="/shop"): dezelfde build draait op vanxcel.be,
// .nl en .com, dus het domein is bij de build niet gekend. Een relatief adres valt op het domein
// waarop de pagina geladen wordt. Zet hier NOOIT één vast domein: dan zeg je Google dat de andere
// twee kopieën zijn en vallen ze uit de index. useDocumentTitle maakt hem in de browser absoluut.

export const REGION_SITES = [
  { hreflang: "nl-BE", url: "https://vanxcel.be", sitemap: "sitemap.xml" },
  { hreflang: "nl-NL", url: "https://vanxcel.nl", sitemap: "sitemap-nl.xml" },
  { hreflang: "en", url: "https://vanxcel.com", sitemap: "sitemap-com.xml" },
] as const;
export const X_DEFAULT_URL = "https://vanxcel.com";

export type PageMeta = {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "product";
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
};

export const PAGES: PageMeta[] = [
  {
    path: "/shop",
    title: "Shop — LiFePO4 batterijen, omvormers & bekabeling | VanXcel",
    description:
      "Ontdek alle VanXcel producten: LiFePO4 batterijen, omvormers, laders, zonnepanelen en bekabeling voor je campervan. Snelle levering vanuit België.",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    path: "/categories",
    title: "Alle categorieën — campervan-elektriciteit | VanXcel",
    description:
      "Ontdek het volledige VanXcel-assortiment per categorie: alles wat je nodig hebt voor een volledig powered campervan.",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/configurator",
    title: "Campervan configurator — jouw energiesysteem | VanXcel",
    description:
      "Kies merk, model en bouwjaar van je campervan en vind stap voor stap het energiesysteem dat erbij past.",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/calculator",
    title: "Tools & calculators — vermogen, batterij en kabels | VanXcel",
    description:
      "Bereken het benodigde vermogen, batterijcapaciteit en kabel-dimensionering voor je campervan met de gratis VanXcel power calculator.",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/about",
    title: "Over VanXcel — Belgisch merk voor off-grid campervans",
    description:
      "Het verhaal achter VanXcel: een Belgisch merk dat campervan-bouwers helpt met betrouwbare off-grid energiesystemen, complete pakketten en eigen support.",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/contact",
    title: "Contact — vragen over je bestelling of installatie | VanXcel",
    description:
      "Vragen over je VanXcel-bestelling of installatie? Stuur ons een bericht via WhatsApp of het contactformulier — we antwoorden meestal binnen één werkdag.",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/faq",
    title: "Veelgestelde vragen — producten, verzending & garantie | VanXcel",
    description:
      "Antwoorden op veelgestelde vragen over VanXcel campervan-systemen: producten, batterijen, verzending, garantie en support.",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/delivery",
    title: "Verzending & levering — levertijden en kosten | VanXcel",
    description:
      "Verzendinformatie, levertijden en bezorgvoorwaarden voor VanXcel-bestellingen in België, Nederland, Frankrijk, Duitsland en Luxemburg.",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    path: "/manuals",
    title: "Schema's & handleidingen — downloads | VanXcel",
    description:
      "Download productdocumentatie en installatiehandleidingen voor VanXcel batterijen, omvormers, laders en meer.",
    changefreq: "monthly",
    priority: 0.5,
  },
];

/** HTML → platte tekst van max. `max` tekens, afgekapt op een woordgrens. */
export function plainExcerpt(html: string | null | undefined, max = 155): string {
  const text = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\u{FE0F}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 60)).replace(/[\s,;:–—-]+$/, "")}…`;
}
