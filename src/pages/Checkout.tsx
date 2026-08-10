import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ChevronLeft, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CheckoutProvider } from "@/integrations/sellqo/CheckoutContext";
import { checkoutAPI } from "@/integrations/sellqo/api";
import { CountrySelect } from "@/components/ui/CountrySelect";

/* ── Step indicator (2 steps) ── */
function StepIndicator() {
  const { currentStep, getSteps } = useCheckout();
  const { t } = useTranslation();
  const steps = getSteps();

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
              currentStep >= step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-sm hidden sm:inline ${currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {t(step.label)}
          </span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Combined Customer + Address ── */
function StepDetailsAndAddress() {
  const { t } = useTranslation();
  const { saveCustomerAndAddress, isLoading, fieldErrors, customer, shippingAddress, billingSameAsShipping: savedBillingSame } = useCheckout();

  const [customerForm, setCustomerForm] = useState({
    email: customer?.email || "",
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    phone: customer?.phone || "",
  });
  const [isB2B, setIsB2B] = useState(!!customer?.is_b2b);
  const [companyName, setCompanyName] = useState(customer?.company_name || "");
  const [vatNumber, setVatNumber] = useState(customer?.vat_number || "");
  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    customer?.vat_verified ? 'valid' : 'idle',
  );
  const [vatInfo, setVatInfo] = useState<{ company_name?: string | null; country_code?: string }>(
    customer?.vat_verified
      ? { company_name: customer?.vat_company_name ?? null, country_code: customer?.vat_country }
      : {},
  );
  const [billingSame, setBillingSame] = useState(savedBillingSame);
  const [shipping, setShipping] = useState({
    street: shippingAddress?.street || "",
    city: shippingAddress?.city || "",
    postal_code: shippingAddress?.postal_code || "",
    country: shippingAddress?.country || "BE",
    company: shippingAddress?.company || "",
  });
  const [billing, setBilling] = useState({
    street: "", city: "", postal_code: "", country: "BE", company: "",
  });

  const runVatValidation = async () => {
    const value = vatNumber.trim();
    if (!value) {
      setVatStatus('idle');
      setVatInfo({});
      return;
    }
    setVatStatus('checking');
    try {
      const res = await checkoutAPI.validateVat(value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = (res as any)?.data && typeof (res as any).data === 'object' ? (res as any).data : res;
      if (r?.valid === true) {
        setVatStatus('valid');
        setVatInfo({ company_name: r.company_name, country_code: r.country_code });
        if (!companyName.trim() && r.company_name) setCompanyName(String(r.company_name));
      } else {
        setVatStatus('invalid');
        setVatInfo({});
      }
    } catch {
      setVatStatus('invalid');
      setVatInfo({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerPayload = isB2B
      ? {
          ...customerForm,
          is_b2b: true,
          company_name: companyName.trim(),
          vat_number: vatNumber.trim(),
          vat_verified: vatStatus === 'valid',
          vat_country: vatInfo.country_code,
          vat_company_name: vatInfo.company_name || undefined,
        }
      : { ...customerForm, is_b2b: false };
    const shippingCompany = shipping.company || (isB2B ? companyName.trim() : "");
    const shippingPayload = {
      first_name: customerForm.first_name,
      last_name: customerForm.last_name,
      ...shipping,
      company: shippingCompany,
    };
    const billingPayload = billingSame
      ? shippingPayload
      : {
          first_name: customerForm.first_name,
          last_name: customerForm.last_name,
          ...billing,
        };
    await saveCustomerAndAddress(
      customerPayload,
      shippingPayload,
      billingSame,
      billingSame ? undefined : billingPayload,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer details */}
      <h2 className="text-lg font-semibold">{t("checkout.customerTitle")}</h2>
      <div>
        <Label htmlFor="email">{t("checkout.email")} *</Label>
        <Input id="email" type="email" required value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} />
        {fieldErrors.email && <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">{t("checkout.firstName")} *</Label>
          <Input id="first_name" required value={customerForm.first_name} onChange={e => setCustomerForm(f => ({ ...f, first_name: e.target.value }))} />
          {fieldErrors.first_name && <p className="text-sm text-destructive mt-1">{fieldErrors.first_name}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">{t("checkout.lastName")} *</Label>
          <Input id="last_name" required value={customerForm.last_name} onChange={e => setCustomerForm(f => ({ ...f, last_name: e.target.value }))} />
          {fieldErrors.last_name && <p className="text-sm text-destructive mt-1">{fieldErrors.last_name}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="phone">{t("checkout.phone")}</Label>
        <Input id="phone" type="tel" value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} />
      </div>

      {/* B2B */}
      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          id="b2b-toggle"
          checked={isB2B}
          onCheckedChange={(checked) => setIsB2B(!!checked)}
        />
        <Label htmlFor="b2b-toggle" className="cursor-pointer">{t("checkout.b2bToggle")}</Label>
      </div>

      {isB2B && (
        <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
          <div>
            <Label htmlFor="b2b-company">{t("checkout.companyName")} *</Label>
            <Input
              id="b2b-company"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="b2b-vat">{t("checkout.vatNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="b2b-vat"
                value={vatNumber}
                onChange={e => { setVatNumber(e.target.value); setVatStatus('idle'); }}
                onBlur={runVatValidation}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runVatValidation}
                disabled={vatStatus === 'checking' || !vatNumber.trim()}
              >
                {t("checkout.vatRecheck")}
              </Button>
            </div>
            {vatStatus === 'checking' && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("checkout.vatChecking")}
              </p>
            )}
            {vatStatus === 'valid' && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {t("checkout.vatValid")}{vatInfo.company_name ? ` — ${vatInfo.company_name}` : ""}
              </p>
            )}
            {vatStatus === 'invalid' && (
              <p className="text-sm text-destructive mt-1">✗ {t("checkout.vatInvalid")}</p>
            )}
          </div>
        </div>
      )}


      {/* Shipping address */}
      <h2 className="text-lg font-semibold mt-8">{t("checkout.addressTitle")}</h2>
      <div>
        <Label>{t("checkout.street")} *</Label>
        <Input required value={shipping.street} onChange={e => setShipping(s => ({ ...s, street: e.target.value }))} />
        {fieldErrors.street && <p className="text-sm text-destructive mt-1">{fieldErrors.street}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{t("checkout.postalCode")} *</Label>
          <Input required value={shipping.postal_code} onChange={e => setShipping(s => ({ ...s, postal_code: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>{t("checkout.city")} *</Label>
          <Input required value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label>{t("checkout.country")} *</Label>
        <CountrySelect value={shipping.country} onChange={(val) => setShipping(s => ({ ...s, country: val }))} />
      </div>
      <div>
        <Label>{t("checkout.company")}</Label>
        <Input value={shipping.company} onChange={e => setShipping(s => ({ ...s, company: e.target.value }))} />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          id="billing-same"
          checked={billingSame}
          onCheckedChange={(checked) => setBillingSame(!!checked)}
        />
        <Label htmlFor="billing-same" className="cursor-pointer">{t("checkout.billingSame")}</Label>
      </div>

      {!billingSame && (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("checkout.billingAddress")}</h3>
          <div>
            <Label>{t("checkout.company")}</Label>
            <Input value={billing.company} onChange={e => setBilling(s => ({ ...s, company: e.target.value }))} />
          </div>
          <div>
            <Label>{t("checkout.street")} *</Label>
            <Input required value={billing.street} onChange={e => setBilling(s => ({ ...s, street: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t("checkout.postalCode")} *</Label>
              <Input required value={billing.postal_code} onChange={e => setBilling(s => ({ ...s, postal_code: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>{t("checkout.city")} *</Label>
              <Input required value={billing.city} onChange={e => setBilling(s => ({ ...s, city: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>{t("checkout.country")} *</Label>
            <CountrySelect value={billing.country} onChange={(val) => setBilling(s => ({ ...s, country: val }))} />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("checkout.continue")}
      </Button>
    </form>
  );
}

/* ── Step 2: Payment ── */
function StepPayment() {
  const { t } = useTranslation();
  const { availablePaymentMethods, completeCheckout, isLoading, goToStep } = useCheckout();
  const [selected, setSelected] = useState("");

  // Detect mobile/tablet for QR filtering
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Filter & sort: bank_transfer first (no fees, desktop only), then direct methods, then klarna
  const visibleMethods = useMemo(() => {
    const ORDER: Record<string, number> = {
      bank_transfer: 0, bancontact: 1, ideal: 2, card: 3, klarna: 4,
    };
    return availablePaymentMethods
      .filter(m => m.available !== false)
      .filter(m => !(m.method === 'bank_transfer' && isMobile))
      .sort((a, b) => (ORDER[a.method] ?? 99) - (ORDER[b.method] ?? 99));
  }, [availablePaymentMethods, isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await completeCheckout(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => goToStep(1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">{t("checkout.paymentTitle")}</h2>
      </div>

      {visibleMethods.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("checkout.noPaymentMethods")}</p>
      ) : (
        <RadioGroup value={selected} onValueChange={setSelected}>
          {visibleMethods.map((method) => {
            const isBankTransfer = method.method === 'bank_transfer';
            return (
              <label
                key={method.method}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selected === method.method ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <RadioGroupItem value={method.method} className="mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {isBankTransfer ? t("checkout.qrName") : method.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isBankTransfer ? t("checkout.qrDescription") : method.description}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading || !selected}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("checkout.processing")}
          </>
        ) : (
          t("checkout.placeOrder")
        )}
      </Button>
    </form>
  );
}

/* ── Order summary sidebar ── */
function OrderSummary() {
  const { t } = useTranslation();
  const { items, subtotal, shippingCost, discount, computedTotal, currency, applyDiscount, removeDiscount, isLoading, reverseCharge, vatText } = useCheckout();
  const [discountCode, setDiscountCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const symbol = currency === 'EUR' ? '€' : currency;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    await applyDiscount(discountCode.trim());
    setApplyingDiscount(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
      <h3 className="font-semibold text-sm">{t("checkout.orderSummary")}</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => {
          const price = Number(item.price) || 0;
          return (
            <div key={item.id} className="flex gap-3">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title || 'Product'}</p>
                {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
              </div>
              <div className="text-right text-sm">
                <p>{item.quantity}×</p>
                <p className="font-semibold">{symbol}{(price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
          <span>{symbol}{(Number(subtotal) || 0).toFixed(2)}</span>
        </div>
        {shippingCost > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("checkout.shipping")}</span>
            <span>{symbol}{(Number(shippingCost) || 0).toFixed(2)}</span>
          </div>
        )}
        {discount && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <Tag size={12} />
              {discount.code}
              <button onClick={removeDiscount} className="text-muted-foreground hover:text-destructive" disabled={isLoading}>
                <X size={12} />
              </button>
            </span>
            <span>-{symbol}{(Number(discount.amount) || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
          <span>{t("checkout.total")}</span>
          <span>{symbol}{computedTotal.toFixed(2)}</span>
        </div>
        {reverseCharge && (
          <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{t("checkout.pricesExclVat")}</p>
            <p>{vatText || t("checkout.reverseChargeNotice")}</p>
          </div>
        )}
      </div>

      {!discount && (
        <div className="flex gap-2">
          <Input
            placeholder={t("checkout.discountPlaceholder")}
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value)}
            className="text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyDiscount}
            disabled={applyingDiscount || !discountCode.trim()}
          >
            {applyingDiscount ? <Loader2 className="h-3 w-3 animate-spin" /> : t("checkout.apply")}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Main checkout page content ── */
function CheckoutContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkoutReady, currentStep, startCheckout, generalError } = useCheckout();

  useEffect(() => {
    if (!checkoutReady) {
      startCheckout().then(success => {
        if (!success) navigate('/shop');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!checkoutReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-2xl font-bold mb-6">{t("checkout.title")}</h1>

          {generalError && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 mb-6 text-sm">
              {generalError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <StepIndicator />
              {currentStep === 1 && <StepDetailsAndAddress />}
              {currentStep === 2 && <StepPayment />}
            </div>
            <div className="lg:col-span-2">
              <OrderSummary />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Wrapped with provider ── */
export default function Checkout() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
