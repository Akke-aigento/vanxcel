// Vite-plugin (alleen bij `vite build`): schrijft per vaste route (src/seo/pages.ts), per product
// en per juridische pagina een eigen HTML-bestand met unieke titel, beschrijving, og-tags en
// hreflang-varianten, plus de drie sitemaps (vanxcel.be / .nl / .com) mét productpagina's.
//
// Twee vormen per route: shop.html én shop/index.html. De Lovable-hosting serveert voor /shop de
// map-index (gemeten 11-10-2026 op studioakke.com); <route>.html alleen bij letterlijk opvragen.
//
// Producten en juridische pagina's komen bij de build uit de sellqo-proxy. Lukt dat niet (geen
// netwerk, time-out), dan bouwt de site gewoon verder met alleen de vaste pagina's.
// Geen canonical in de statische HTML: één build voor drie domeinen (zie src/seo/pages.ts).
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { fetchSeoBundle, guideJsonLd, withOverride, type GuidePage, type SeoOverrides } from "./src/seo/insights";
import { PAGES, REGION_SITES, X_DEFAULT_URL, plainExcerpt, type PageMeta } from "./src/seo/pages";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html: string, attr: "name" | "property", key: string, value: string): string {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

export function applyHead(html: string, page: PageMeta): string {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  out = setMeta(out, "name", "description", page.description);
  out = setMeta(out, "property", "og:title", page.title);
  out = setMeta(out, "property", "og:description", page.description);
  out = setMeta(out, "property", "og:type", page.type ?? "website");
  out = setMeta(out, "name", "twitter:title", page.title);
  out = setMeta(out, "name", "twitter:description", page.description);
  if (page.image) {
    out = setMeta(out, "property", "og:image", page.image);
    out = setMeta(out, "name", "twitter:image", page.image);
  }
  // og:url in index.html wijst naar de homepage van vanxcel.be; op een subpagina klopt dat niet.
  out = out.replace(/\s*<meta\s+property="og:url"[^>]*>/i, "");
  // data-hreflang="true": useDocumentTitle ruimt deze op en zet ze opnieuw bij navigatie.
  const alts = [
    ...REGION_SITES.map((s) => [s.hreflang, `${s.url}${page.path}`] as const),
    ["x-default", `${X_DEFAULT_URL}${page.path}`] as const,
  ]
    .map(([lang, href]) => `    <link rel="alternate" hreflang="${lang}" href="${href}" data-hreflang="true" />`)
    .join("\n");
  return out.replace("</head>", `${alts}\n  </head>`);
}

export function sitemapXml(base: string, pages: PageMeta[], lastmod: string): string {
  const urls = [{ path: "/", changefreq: "weekly", priority: 1 } as PageMeta, ...pages].map((p) => {
    const alts = [
      ...REGION_SITES.map((s) => [s.hreflang, `${s.url}${p.path}`] as const),
      ["x-default", `${X_DEFAULT_URL}${p.path}`] as const,
    ]
      .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
      .join("\n");
    return [
      "  <url>",
      `    <loc>${base}${p.path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      p.changefreq ? `    <changefreq>${p.changefreq}</changefreq>` : null,
      `    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>`,
      alts,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

type ApiProduct = { name?: string; slug?: string; description?: string; featured_image?: string | null; images?: string[] };
type ApiLegal = { slug?: string; title?: string };

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "X-Tenant-ID": "vanxcel", "Accept-Language": "nl-BE" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Oude Shopify-URL /products/<handle> → /shop/<slug> (handles = slugs). Een meta-refresh met 0 s
// behandelt Google als permanente redirect; de JS-regel is voor browsers die meta-refresh negeren.
// De echte 301 hoort in de Cloudflare Worker; dit is het vangnet dat zonder Worker werkt.
export function legacyRedirectHtml(target: string): string {
  const t = esc(target);
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>VanXcel</title>
<meta http-equiv="refresh" content="0; url=${t}">
<script>location.replace(${JSON.stringify(target)})</script>
</head><body><a href="${t}">${t}</a></body></html>
`;
}

async function dynamicPages(projectId: string | undefined): Promise<PageMeta[]> {
  if (!projectId) return [];
  const api = `https://${projectId}.supabase.co/functions/v1/sellqo-proxy`;
  const [prod, legal] = await Promise.all([
    getJson<{ data?: { products?: ApiProduct[] } }>(`${api}/products?per_page=100`),
    getJson<{ data?: ApiLegal[] }>(`${api}/legal`),
  ]);
  const out: PageMeta[] = [];
  for (const p of prod?.data?.products ?? []) {
    if (!p.slug || !p.name) continue;
    out.push({
      path: `/shop/${p.slug}`,
      title: `${p.name} | VanXcel`,
      // Productnaam vooraan: varianten (zwart/rood, 35/50 mm²) delen in SellQo vaak dezelfde
      // omschrijving en kregen anders identieke beschrijvingen.
      description: plainExcerpt(p.description).startsWith(p.name)
        ? plainExcerpt(p.description)
        : plainExcerpt(`${p.name}. ${p.description ?? ""}`) ||
          `${p.name} — bestel bij VanXcel met 2 jaar garantie en snelle levering.`,
      image: p.featured_image ?? p.images?.[0] ?? undefined,
      type: "product",
      changefreq: "weekly",
      priority: 0.8,
    });
  }
  for (const l of legal?.data ?? []) {
    if (!l.slug || !l.title) continue;
    out.push({
      path: `/legal/${l.slug}`,
      title: `${l.title} | VanXcel`,
      description: `${l.title} van VanXcel, het Belgische merk voor off-grid energiesystemen in campervans: alle afspraken helder op één pagina.`,
      changefreq: "yearly",
      priority: 0.2,
    });
  }
  console.log(`[seo-pages] ${out.length} dynamische pagina's uit SellQo${prod ? "" : " (producten niet opgehaald)"}`);
  return out;
}

export function seoPages(): Plugin {
  let outDir = "dist";
  let overrides: SeoOverrides = {};
  let content: GuidePage[] = [];
  let projectId: string | undefined;
  return {
    name: "vanxcel-seo-pages",
    apply: "build",
    // Goedgekeurde teksten uit Akke Insights ophalen; ook aan de browser meegeven.
    async config() {
      const bundle = await fetchSeoBundle();
      overrides = bundle.pages;
      content = bundle.content;
      console.log(
        `[seo-pages] ${Object.keys(overrides).length} goedgekeurde teksten en ${content.length} gidspagina's uit Insights`,
      );
      return {
        define: {
          __SEO_OVERRIDES__: JSON.stringify(overrides),
          __SEO_CONTENT__: JSON.stringify(content),
        },
      };
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      projectId = config.env["VITE_SUPABASE_PROJECT_ID"] ?? process.env["VITE_SUPABASE_PROJECT_ID"];
    },
    async closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const base = fs.readFileSync(indexPath, "utf8");
      // Gidspagina's uit de contentmotor van Insights: eigen head + FAQ-gegevens op /gids/<slug>.
      const guides = new Map(content.map((g) => [`/gids/${g.slug}`, g]));
      const pages: PageMeta[] = [
        ...[...PAGES, ...(await dynamicPages(projectId))].map((p) => withOverride(p, overrides)),
        ...content.map((g) => ({
          path: `/gids/${g.slug}`,
          title: g.title,
          description: g.description,
          changefreq: "monthly" as const,
          priority: 0.6,
        })),
      ];
      for (const page of pages) {
        let html = applyHead(base, page);
        const guide = guides.get(page.path);
        if (guide)
          html = html.replace(
            "</head>",
            `    <script type="application/ld+json" data-insights="guide">${JSON.stringify(guideJsonLd(guide, `${X_DEFAULT_URL}${page.path}`)).replace(/</g, "\\u003c")}</script>\n  </head>`,
          );
        for (const file of [
          path.join(outDir, `${page.path.slice(1)}.html`),
          path.join(outDir, page.path.slice(1), "index.html"),
        ]) {
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, html);
        }
      }
      for (const page of pages) {
        if (!page.path.startsWith("/shop/")) continue;
        const legacy = path.join(outDir, "products", page.path.slice("/shop/".length), "index.html");
        fs.mkdirSync(path.dirname(legacy), { recursive: true });
        fs.writeFileSync(legacy, legacyRedirectHtml(page.path));
      }
      const lastmod = new Date().toISOString().slice(0, 10);
      for (const site of REGION_SITES) {
        fs.writeFileSync(path.join(outDir, site.sitemap), sitemapXml(site.url, pages, lastmod));
      }
    },
  };
}
