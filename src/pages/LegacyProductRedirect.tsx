import { Navigate, useParams } from "react-router-dom";

// Oude Shopify-URL's (/products/<handle>, ook /products/<handle>.json) staan nog in Google.
// De handles zijn identiek aan de SellQo-slugs, dus we sturen door naar /shop/<slug>.
// Vangnet in de browser; de build schrijft ook statische doorverwijspagina's (seo-pages-plugin).
export default function LegacyProductRedirect() {
  const { slug = "" } = useParams<{ slug: string }>();
  const clean = slug.replace(/\.(json|js|xml|oembed)$/i, "");
  return <Navigate to={clean ? `/shop/${clean}` : "/shop"} replace />;
}
