import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "@/integrations/sellqo/types";
import { useCartContext } from "@/integrations/sellqo/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2 } from "lucide-react";

interface Props {
  product: Product;
}

export default function BundleContents({ product }: Props) {
  const { t } = useTranslation();
  const { addItem, isAddingItem } = useCartContext();

  const items = product.bundle_items;
  if (!items || items.length === 0) return null;

  const individualTotal = product.bundle_individual_total ?? items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const bundlePrice = product.price;
  const saving = individualTotal - bundlePrice;
  const savingPct = individualTotal > 0 ? Math.round((saving / individualTotal) * 100) : 0;

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
        {savingPct > 0 && (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
            -{savingPct}%
          </Badge>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.map((item) => {
          const img = item.product.images?.[0];
          return (
            <div key={item.product_id} className="flex items-center gap-3 p-3">
              <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {img ? (
                  <img src={img} alt={item.product.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground line-through">
                    €{item.product.price.toFixed(2)}
                  </span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      ×{item.quantity}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-secondary/30 px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("bundle.individualTotal")}</span>
          <span className="line-through text-muted-foreground">€{individualTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>{t("bundle.bundlePrice")}</span>
          <span className="text-primary">€{bundlePrice.toFixed(2)}</span>
        </div>
        {saving > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>{t("bundle.youSave")}</span>
            <span>€{saving.toFixed(2)}</span>
          </div>
        )}
        <Button
          onClick={handleAddBundle}
          disabled={isAddingItem || product.stock_status === "out_of_stock"}
          className="w-full mt-2"
        >
          {isAddingItem ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("product.adding")}</>
          ) : (
            t("bundle.addToCart")
          )}
        </Button>
      </div>
    </div>
  );
}
