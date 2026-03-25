import { useMemo } from "react";
import { useProducts } from "@/integrations/sellqo/hooks";
import { vanxcelProducts } from "@/lib/vanxcel-products";
import type { Product } from "@/integrations/sellqo/types";

/**
 * Matches SellQo live product prices to VanXcel catalog SKUs.
 * Returns a Map<sku, livePrice> for all products found in the shop.
 * Coming-soon products (no shopUrl) won't have a match and won't appear in the map.
 */
export function useVanXcelPrices() {
  const { data: shopProducts, isLoading } = useProducts();

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!shopProducts) return map;

    // Extract the array of products from the API response
    const products: Product[] = Array.isArray(shopProducts)
      ? shopProducts
      : (shopProducts as any)?.data ?? (shopProducts as any)?.products ?? [];

    // Build a slug→price lookup from SellQo products
    const slugPriceMap = new Map<string, number>();
    for (const p of products) {
      if (p.slug && typeof p.price === "number") {
        slugPriceMap.set(p.slug, p.price);
      }
    }

    // Match VanXcel catalog items to SellQo products via shopUrl slug
    for (const vp of vanxcelProducts) {
      if (!vp.shopUrl) continue; // coming soon — no shop link
      // shopUrl looks like "/shop/vanxcel-5-in-1-converter-1000w"
      const slug = vp.shopUrl.replace(/^\/shop\//, "");
      const livePrice = slugPriceMap.get(slug);
      if (livePrice !== undefined) {
        map.set(vp.sku, livePrice);
      }
    }

    return map;
  }, [shopProducts]);

  return { priceMap, isLoading };
}
