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

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.products.detail(product.slug),
      queryFn: () => productsAPI.getBySlug(product.slug),
    });
  };

  return (
    <Link
      to={`/shop/${product.slug}`}
      onMouseEnter={handleMouseEnter}
      className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-square bg-foreground/[0.03] p-6 flex items-center justify-center overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-5xl">📦</span>
            <span className="text-xs">{t("product.photoSoon")}</span>
          </div>
        )}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
          </div>
        )}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">{t("product.outOfStock")}</span>
          </div>
        )}
        {product.stock_status === 'low_stock' && (
          <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            {t("product.almostGone")}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            €{product.price.toFixed(2)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              €{product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
