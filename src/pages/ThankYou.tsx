import { useEffect, useRef, useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/integrations/sellqo/CartContext";
import { checkoutAPI } from "@/integrations/sellqo/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ThankYou = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { clearCart } = useCartContext();
  const cleared = useRef(false);

  // Stripe polling state
  const [pollingOrder, setPollingOrder] = useState(false);
  const [polledOrder, setPolledOrder] = useState<{ order_number: string; total: number; currency: string } | null>(null);
  const [pollFailed, setPollFailed] = useState(false);

  // State passed from checkout complete (manual / qr)
  const routeState = location.state as {
    orderNumber?: string;
    total?: number;
    currency?: string;
    bankDetails?: { iban: string; account_holder: string; reference: string };
    qrData?: { image_url?: string; payload?: string };
    paymentType?: string;
  } | null;

  const sessionId = searchParams.get("session_id");

  // For manual/qr/unknown: clear cart immediately
  useEffect(() => {
    if (routeState?.paymentType && !cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [routeState, clearCart]);

  // For Stripe: poll for order then clear cart
  useEffect(() => {
    if (!sessionId || cleared.current) return;

    let cancelled = false;
    setPollingOrder(true);

    async function pollForOrder(attempts = 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await checkoutAPI.getOrderBySession(sessionId!) as any;
        if (!cancelled && response?.success && response?.data?.order_number) {
          setPolledOrder({
            order_number: response.data.order_number,
            total: response.data.total,
            currency: response.data.currency,
          });
          setPollingOrder(false);
          if (!cleared.current) {
            clearCart();
            cleared.current = true;
          }
          return;
        }
      } catch {
        // webhook might not have processed yet
      }

      if (!cancelled && attempts < 5) {
        setTimeout(() => pollForOrder(attempts + 1), 2000);
      } else if (!cancelled) {
        // Give up polling — show generic thank you
        setPollFailed(true);
        setPollingOrder(false);
        if (!cleared.current) {
          clearCart();
          cleared.current = true;
        }
      }
    }

    pollForOrder();
    return () => { cancelled = true; };
  }, [sessionId, clearCart]);

  const paymentType = routeState?.paymentType || (sessionId ? 'redirect' : 'unknown');

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="font-display text-3xl font-bold">{t("thankYou.title")}</h1>

          {/* Order number from route state */}
          {routeState?.orderNumber && (
            <p className="text-muted-foreground">
              {t("thankYou.orderNumber")}: <span className="font-mono font-semibold text-foreground">{routeState.orderNumber}</span>
            </p>
          )}

          {/* Stripe redirect — polling */}
          {paymentType === 'redirect' && pollingOrder && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>{t("thankYou.verifyingPayment")}</p>
            </div>
          )}

          {paymentType === 'redirect' && polledOrder && (
            <>
              <p className="text-muted-foreground">
                {t("thankYou.orderNumber")}: <span className="font-mono font-semibold text-foreground">{polledOrder.order_number}</span>
              </p>
              <p className="text-muted-foreground">{t("thankYou.stripePaid")}</p>
            </>
          )}

          {paymentType === 'redirect' && pollFailed && (
            <p className="text-muted-foreground">{t("thankYou.stripePaid")}</p>
          )}

          {/* Bank transfer */}
          {paymentType === 'manual' && routeState?.bankDetails && (
            <div className="border border-border rounded-lg text-left p-5 space-y-3">
              <h2 className="font-semibold text-sm">{t("thankYou.bankTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("thankYou.bankInstructions")}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="font-mono font-semibold">{routeState.bankDetails.iban}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("thankYou.accountHolder")}</span>
                  <span className="font-semibold">{routeState.bankDetails.account_holder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("thankYou.reference")}</span>
                  <span className="font-mono font-semibold">{routeState.bankDetails.reference}</span>
                </div>
                {routeState.total != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("thankYou.amount")}</span>
                    <span className="font-semibold">€{routeState.total.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-2">{t("thankYou.bankNote")}</p>
            </div>
          )}

          {/* QR payment */}
          {paymentType === 'qr' && routeState?.qrData && (
            <div className="border border-border rounded-lg p-5 space-y-3">
              <h2 className="font-semibold text-sm">{t("thankYou.qrTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("thankYou.qrInstructions")}</p>
              {routeState.qrData.image_url && (
                <img src={routeState.qrData.image_url} alt="QR Code" className="mx-auto w-48 h-48" />
              )}
              {routeState.total != null && (
                <p className="font-semibold">€{routeState.total.toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Default */}
          {paymentType === 'unknown' && (
            <p className="text-muted-foreground">{t("thankYou.subtitle")}</p>
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
