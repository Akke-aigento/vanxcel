import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "@/integrations/sellqo/types";
import { useCartContext } from "@/integrations/sellqo/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2, Minus, Plus } from "lucide-react";

interface Props {
  product: Product;
}

export default function BundleContents({ product }: Props) {
  const { t } = useTranslation();
  const { addItem, isAddingItem } = useCartContext();

  const items = product.bundle_items;

  const [quantities, setQuantities] = useState<number[]>(
    () => items?.map((i) => 
      i.product.in_stock === false ? 0 : (i.min_quantity ?? i.quantity)
    ) ?? []
  );

  const isDynamic = product.bundle_pricing_model === "dynamic";

  // Full total scales dynamically with chosen quantities (in-stock only)
  const fullTotal = useMemo(
    () =>
      (items ?? []).reduce(
        (sum, item, idx) => 
          item.product.in_stock === false ? sum : sum + (item.product?.price || 0) * (quantities[idx] ?? item.quantity),
        0
      ),
    [items, quantities]
  );

  // Debug log to see what the API actually sends
  console.log('[Bundle debug]', {
    bundle_discount_type: product.bundle_discount_type,
    bundle_discount_value: product.bundle_discount_value,
    bundle_savings: product.bundle_savings,
    bundle_individual_total: product.bundle_individual_total,
    price: product.price,
    bundle_pricing_model: product.bundle_pricing_model,
  });

  // Determine discount rate from explicit API fields
  const discountRate = useMemo(() => {
    if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
      return product.bundle_discount_value / 100;
    }
    if (product.bundle_discount_type === 'fixed' && product.bundle_discount_value && fullTotal > 0) {
      return product.bundle_discount_value / fullTotal;
    }
    // Fallback: only for FIXED pricing model (not dynamic)
    if (!isDynamic && product.bundle_individual_total && product.bundle_savings && product.bundle_individual_total > 0) {
      return product.bundle_savings / product.bundle_individual_total;
    }
    return 0;
  }, [product, fullTotal, isDynamic]);

  if (!items || items.length === 0) return null;

  const bundlePrice = isDynamic
    ? (product.bundle_discount_type === 'fixed' && product.bundle_discount_value
        ? fullTotal - product.bundle_discount_value
        : fullTotal * (1 - discountRate))
    : product.price;
  const saving = isDynamic
    ? (product.bundle_discount_type === 'fixed' && product.bundle_discount_value
        ? product.bundle_discount_value
        : fullTotal * discountRate)
    : (product.bundle_savings ?? 0);
  const savingPct = discountRate > 0 
    ? Math.round(discountRate * 100) 
    : (fullTotal > 0 ? Math.round((saving / fullTotal) * 100) : 0);

  const updateQty = (index: number, delta: number) => {
    const item = items[index];
    if (item.product.in_stock === false) return;
    setQuantities((prev) => {
      const next = [...prev];
      const min = item.min_quantity ?? 0;
      const max = item.max_quantity ?? Infinity;
      next[index] = Math.min(max, Math.max(min, next[index] + delta));
      return next;
    });
  };

  const handleAddBundle = () => {
    addItem({
      product_id: product.id,
      variant_id: product.variants?.[0]?.id,
      quantity: 1,
      title: product.title,
      price: bundlePrice,
      image: product.images?.[0]?.url,
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-primary" />
          <span className="font-semibold text-sm">
            {t("bundle.header", { count: items.length })}
          </span>
        </div>
        {saving > 0 && (
          <Badge variant="default" className="bg-primary hover:bg-primary/90">
            -{savingPct}%
          </Badge>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.map((item, idx) => {
          const img = item.product.image;
          const outOfStock = item.product.in_stock === false;
          const qty = quantities[idx];
          const canAdjust = item.customer_can_adjust === true;
          const subtotal = item.product.price * qty;

          return (
            <div
              key={item.product_id}
              className={`flex items-center gap-3 p-3 ${outOfStock ? "opacity-50" : ""}`}
            >
              {/* Image */}
              <div className="w-[60px] h-[60px] bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={item.product.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/shop/${item.product.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>€{item.product.price.toFixed(2)} / {t("bundle.perPiece")}</span>
                  {outOfStock && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0">
                      {t("product.outOfStock")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {canAdjust && !outOfStock ? (
                  <div className="flex items-center border border-border rounded">
                    <button
                      onClick={() => updateQty(idx, -1)}
                      disabled={qty <= (item.min_quantity ?? 0)}
                      className="p-1 hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => updateQty(idx, 1)}
                      disabled={item.max_quantity != null && qty >= item.max_quantity}
                      className="p-1 hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : outOfStock ? (
                  <span className="text-xs text-destructive font-medium">×0</span>
                ) : (
                  <span className="text-sm text-muted-foreground">×{qty}</span>
                )}
              </div>

              {/* Subtotal */}
              <span className="text-sm font-medium w-16 text-right flex-shrink-0">
                {outOfStock ? "—" : `€${subtotal.toFixed(2)}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-secondary/30 px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("bundle.individualTotal")}</span>
          <span className="line-through text-muted-foreground">
            €{fullTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>{t("bundle.bundlePrice")}</span>
          <span className="text-primary">€{bundlePrice.toFixed(2)}</span>
        </div>
        {saving > 0 && (
          <div className="flex justify-between text-sm font-medium">
            <span className="text-green-600 dark:text-green-400">{t("bundle.youSave")}</span>
            <Badge className="bg-green-600 hover:bg-green-700 text-white">
              {t("bundle.saveBadge", { amount: saving.toFixed(2) })}
            </Badge>
          </div>
        )}
        <Button
          onClick={handleAddBundle}
          disabled={isAddingItem || product.stock_status === "out_of_stock"}
          className="w-full mt-2"
        >
          {isAddingItem ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("product.adding")}
            </>
          ) : (
            t("bundle.addToCart")
          )}
        </Button>
      </div>
    </div>
  );
}
