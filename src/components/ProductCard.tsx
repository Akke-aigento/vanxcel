import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "@/integrations/sellqo/types";
import { useQueryClient } from "@tanstack/react-query";
import { productsAPI } from "@/integrations/sellqo/api";
import { sellqoKeys } from "@/integrations/sellqo/hooks";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mainImage = product.images?.[0]?.url;

  const isBundle = product.product_type === 'bundle';

  // Bundle pricing — direct uit beschikbare velden
  const originalPrice = isBundle ? Number(product.bundle_individual_total ?? 0) : 0;
  const bundleSavings = isBundle ? Number(product.bundle_savings ?? 0) : 0;

  let bundleDiscountRate = 0;
  if (isBundle && product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    bundleDiscountRate = product.bundle_discount_value / 100;
  } else if (isBundle) {
    const match = product.title?.match(/(\d+)%\s*(discount|korting|rabatt|remise)/i);
    if (match) bundleDiscountRate = parseInt(match[1], 10) / 100;
  }

  const bundlePrice = isBundle && originalPrice > 0
    ? (bundleDiscountRate > 0 ? originalPrice * (1 - bundleDiscountRate) : Math.max(0, originalPrice - bundleSavings))
    : 0;
  const showBundlePricing = isBundle && bundlePrice > 0;

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.products.detail(product.slug),
      queryFn: () => productsAPI.getBySlug(product.slug),
    });
  };

  return (
    <div>
      <Link
        to={`/shop/${product.slug}`}
        onMouseEnter={handleMouseEnter}
        className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.08)] transition-all duration-300 block"
      >
        <div className="relative aspect-square bg-foreground/[0.03] p-6 flex items-center justify-center overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain group-hover:scale-[1.15] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <span className="text-5xl">📦</span>
              <span className="text-xs">{t("product.photoSoon")}</span>
            </div>
          )}
          {bundleDiscountRate > 0 ? (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
              -{Math.round(bundleDiscountRate * 100)}%
            </div>
          ) : product.compare_at_price && product.compare_at_price > product.price ? (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
              -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
            </div>
          ) : null}
          {product.stock_status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center pointer-events-none">
              <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">{t("product.outOfStock")}</span>
            </div>
          )}
          {product.product_type === 'bundle' && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
              {t("product.bundle")}
            </div>
          )}
          {product.stock_status === 'low_stock' && !product.product_type?.startsWith('bundle') && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
              {t("product.almostGone")}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
{showBundlePricing ? (
              <>
                <span className="text-xs text-muted-foreground">{t('product.startingFrom')}</span>
                <span className="text-lg font-bold text-primary">€{bundlePrice.toFixed(2)}</span>
                {bundlePrice < originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">€{originalPrice.toFixed(2)}</span>
                )}
              </>
            ) : isBundle ? (
              <span className="text-sm font-medium text-primary">{t('product.viewBundle')}</span>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">
                  €{product.price.toFixed(2)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    €{product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
