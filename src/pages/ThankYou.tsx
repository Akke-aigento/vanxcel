import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sellqoFetch, extractSingle } from "@/integrations/sellqo/client";
import { normalizeCart } from "@/integrations/sellqo/normalizer";
import { useCartContext } from "@/integrations/sellqo/CartContext";
import type { Cart } from "@/integrations/sellqo/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ThankYou = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const cartId = searchParams.get("cart_id");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(!!cartId);
  const { clearCart } = useCartContext();
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [clearCart]);

  useEffect(() => {
    if (!cartId) return;
    sellqoFetch(`/cart/${cartId}`)
      .then((data) => {
        const raw = extractSingle<Cart>(data) || data;
        setCart(normalizeCart(raw));
      })
      .catch((err) => console.error("Failed to load order:", err))
      .finally(() => setLoading(false));
  }, [cartId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="font-display text-3xl font-bold">{t("thankYou.title")}</h1>
          <p className="text-muted-foreground">{t("thankYou.subtitle")}</p>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden text-left">
              <div className="bg-muted/50 px-4 py-3">
                <h2 className="font-semibold text-sm">{t("thankYou.orderSummary")}</h2>
              </div>
              <div className="divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
                    </div>
                    <div className="text-right text-sm">
                      <p>{item.quantity}×</p>
                      <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-3 flex justify-between font-semibold">
                <span>{t("thankYou.total")}</span>
                <span>€{cart.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button asChild>
            <Link to="/shop">{t("thankYou.backToShop")}</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ThankYou;
