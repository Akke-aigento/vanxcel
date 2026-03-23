import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/integrations/sellqo/CartContext";

const CartDrawer = () => {
  const { t } = useTranslation();
  const { cart, isLoading, updateQuantity, removeItem, checkout, isOpen, openCart, closeCart } = useCartContext();
  const [checkingOut, setCheckingOut] = useState(false);

  const itemCount = cart?.item_count ?? 0;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await checkout({
        success_url: `${window.location.origin}/bedankt`,
        cancel_url: `${window.location.origin}/shop`,
      });
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetTrigger asChild>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("cart.title")}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="text-sm">{t("cart.empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 py-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variant_title && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                    <p className="text-sm font-semibold mt-1">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          item.quantity <= 1
                            ? removeItem(item.id)
                            : updateQuantity(item.id, item.quantity - 1)
                        }
                        className="h-6 w-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span className="font-semibold">€{(cart.subtotal ?? cart.total).toFixed(2)}</span>
              </div>
              {cart.discount_amount != null && cart.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("cart.discount")}</span>
                  <span>-€{cart.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>{t("cart.total")}</span>
                <span>€{cart.total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("cart.loading")}
                  </>
                ) : (
                  t("cart.checkout")
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
