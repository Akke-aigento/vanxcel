// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes one sitemap per region:
//   public/sitemap.xml      → vanxcel.be (BE / nl)
//   public/sitemap-nl.xml   → vanxcel.nl (NL / nl)
//   public/sitemap-com.xml  → vanxcel.com (EN)
import { writeFileSync } from "fs";
import { resolve } from "path";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/categories", changefreq: "weekly", priority: "0.8" },
  { path: "/build", changefreq: "monthly", priority: "0.7" },
  { path: "/configurator", changefreq: "monthly", priority: "0.7" },
  { path: "/calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/delivery", changefreq: "monthly", priority: "0.5" },
  { path: "/manuals", changefreq: "monthly", priority: "0.5" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
];

const SITES = [
  { baseUrl: "https://vanxcel.be", file: "public/sitemap.xml" },
  { baseUrl: "https://vanxcel.nl", file: "public/sitemap-nl.xml" },
  { baseUrl: "https://vanxcel.com", file: "public/sitemap-com.xml" },
];

function generateSitemap(baseUrl: string, items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${baseUrl}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

for (const site of SITES) {
  writeFileSync(resolve(site.file), generateSitemap(site.baseUrl, entries));
  console.log(`${site.file} written (${entries.length} entries) → ${site.baseUrl}`);
}
