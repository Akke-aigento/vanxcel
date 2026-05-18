import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkoutAPI } from './api';
import { extractSingle } from './client';
import { getStoredCartId, clearStoredCartId } from './hooks';
import type {
  CheckoutStartData,
  CheckoutCompleteData,
  CheckoutOrderItem,
  PaymentMethod,
  ShippingMethod,
  CustomerData,
  AddressData,
} from './types';

interface CheckoutState {
  checkoutReady: boolean;
  items: CheckoutOrderItem[];
  availablePaymentMethods: PaymentMethod[];
  availableShippingMethods: ShippingMethod[];
  customer: CustomerData | null;
  shippingAddress: AddressData | null;
  billingAddress: AddressData | null;
  billingSameAsShipping: boolean;
  selectedShippingMethod: string | null;
  selectedPaymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  discount: { code: string; amount: number } | null;
  total: number;
  currency: string;
  currentStep: number;
  isLoading: boolean;
  fieldErrors: Record<string, string>;
  generalError: string | null;
}

interface CheckoutContextType extends CheckoutState {
  startCheckout: () => Promise<boolean>;
  saveCustomerAndAddress: (
    customer: CustomerData,
    shipping: AddressData,
    billingSame: boolean,
    billing?: AddressData,
  ) => Promise<boolean>;
  completeCheckout: (paymentMethodId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => Promise<void>;
  goToStep: (step: number) => void;
  getSteps: () => { id: number; label: string }[];
  computedTotal: number;
}

const initialState: CheckoutState = {
  checkoutReady: false,
  items: [],
  availablePaymentMethods: [],
  availableShippingMethods: [],
  customer: null,
  shippingAddress: null,
  billingAddress: null,
  billingSameAsShipping: true,
  selectedShippingMethod: null,
  selectedPaymentMethod: null,
  subtotal: 0,
  shippingCost: 0,
  discount: null,
  total: 0,
  currency: 'EUR',
  currentStep: 1,
  isLoading: false,
  fieldErrors: {},
  generalError: null,
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

function getCheckoutBaseUrl() {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.be')) return 'https://vanxcel.be';
  if (hostname.endsWith('.nl')) return 'https://vanxcel.nl';
  if (hostname.endsWith('.com')) return 'https://vanxcel.com';
  return window.location.origin;
}

function getCartId(): string | null {
  return getStoredCartId();
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<CheckoutState>(initialState);

  const setLoading = (loading: boolean) => setState(s => ({ ...s, isLoading: loading }));
  const clearErrors = () => setState(s => ({ ...s, fieldErrors: {}, generalError: null }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleApiError = (result: any) => {
    const error = result?.error;
    if (error?.code === 'VALIDATION_ERROR' && error?.fields) {
      setState(s => ({ ...s, fieldErrors: error.fields }));
    } else {
      const msg = error?.message || 'Er ging iets mis. Probeer het opnieuw.';
      setState(s => ({ ...s, generalError: msg }));
      toast.error(msg);
    }
  };

  const startCheckout = useCallback(async () => {
    const cartId = getCartId();
    if (!cartId) {
      toast.error('Je winkelwagen is leeg.');
      return false;
    }
    setLoading(true);
    clearErrors();
    try {
      const response = await checkoutAPI.start(cartId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return false;
      }
      const data: CheckoutStartData = r?.data || extractSingle<CheckoutStartData>(response) || r;
      // Parse items with price fallbacks to prevent NaN
      const items = (data.items || []).map(item => ({
        ...item,
        price: Number(item.price) || Number((item as any).unit_price) || Number((item as any).line_total) || 0,
      }));
      setState(s => ({
        ...s,
        checkoutReady: true,
        items,
        availablePaymentMethods: data.available_payment_methods || [],
        availableShippingMethods: data.available_shipping_methods || [],
        subtotal: Number(data.subtotal) || 0,
        total: Number(data.total) || 0,
        currency: data.currency || 'EUR',
        currentStep: 1,
      }));
      return true;
    } catch (err) {
      console.error('Checkout start failed:', err);
      toast.error('Kon checkout niet starten. Probeer het opnieuw.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Combined step 1: save customer + address + auto-select shipping → go to step 2 (payment) */
  const saveCustomerAndAddress = useCallback(async (
    customer: CustomerData,
    shipping: AddressData,
    billingSame: boolean,
    billing?: AddressData,
  ) => {
    const cartId = getCartId();
    if (!cartId) return false;
    setLoading(true);
    clearErrors();
    try {
      // 1. Save customer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const custResp = await checkoutAPI.saveCustomer(cartId, customer) as any;
      if (custResp?.success === false) {
        handleApiError(custResp);
        return false;
      }

      // 2. Save address
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addrResp = await checkoutAPI.saveAddress(cartId, shipping, billingSame, billing) as any;
      if (addrResp?.success === false) {
        handleApiError(addrResp);
        return false;
      }

      // 3. Auto-select shipping if only 1 method
      if (state.availableShippingMethods.length === 1) {
        const autoMethod = state.availableShippingMethods[0];
        try {
          await checkoutAPI.selectShipping(cartId, autoMethod.id);
          setState(s => ({
            ...s,
            selectedShippingMethod: autoMethod.id,
            shippingCost: autoMethod.price || 0,
          }));
        } catch { /* proceed anyway */ }
      }

      setState(s => ({
        ...s,
        customer,
        shippingAddress: shipping,
        billingAddress: billingSame ? null : (billing || null),
        billingSameAsShipping: billingSame,
        currentStep: 2, // go to payment
      }));
      return true;
    } catch (err) {
      console.error('Save customer & address failed:', err);
      toast.error('Kon gegevens niet opslaan.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.availableShippingMethods]);

  const completeCheckout = useCallback(async (paymentMethodId: string) => {
    const cartId = getCartId();
    if (!cartId) return;
    setLoading(true);
    clearErrors();
    try {
      const baseUrl = getCheckoutBaseUrl();
      const response = await checkoutAPI.complete(
        cartId,
        paymentMethodId,
        `${baseUrl}/bedankt?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/shop`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return;
      }
      const data: CheckoutCompleteData = r?.data || {};

      switch (data.payment_type) {
        case 'redirect':
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            toast.error('Geen betaal-URL ontvangen. Probeer het opnieuw.');
          }
          break;
        case 'manual':
          clearStoredCartId();
          navigate('/bedankt', {
            state: {
              orderNumber: data.order_number,
              total: data.total,
              currency: data.currency,
              bankDetails: data.bank_details,
              paymentType: 'manual',
            },
          });
          break;
        case 'qr':
          navigate('/checkout/qr-betaling', {
            state: {
              orderNumber: data.order_number,
              total: data.total,
              currency: data.currency,
              qrData: data.qr_data,
              bankDetails: data.bank_details,
            },
          });
          break;
        default:
          // Unknown payment_type — do NOT navigate, show error
          toast.error('Onbekende betaalmethode. Neem contact op met onze klantenservice.');
          break;
      }
    } catch (err) {
      console.error('Complete checkout failed:', err);
      toast.error('Betaling kon niet worden gestart. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const applyDiscountFn = useCallback(async (code: string) => {
    const cartId = getCartId();
    if (!cartId) return false;
    setLoading(true);
    try {
      const response = await checkoutAPI.applyDiscount(cartId, code);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        toast.error(r?.error?.message || r?.error || 'Ongeldige kortingscode.');
        return false;
      }
      const data = (r?.data && typeof r.data === 'object') ? r.data : r;
      const firstDiscount = Array.isArray(data?.applied_discounts) && data.applied_discounts.length > 0
        ? data.applied_discounts[0]
        : null;
      setState(s => ({
        ...s,
        discount: firstDiscount
          ? { code: firstDiscount.code, amount: Number(firstDiscount.amount) || 0 }
          : (Number(data?.discount_total) > 0
              ? { code, amount: Number(data.discount_total) }
              : null),
        subtotal: data?.subtotal != null ? Number(data.subtotal) : s.subtotal,
        shippingCost: data?.shipping_cost != null ? Number(data.shipping_cost) : s.shippingCost,
        total: data?.total != null ? Number(data.total) : s.total,
      }));
      return true;
    } catch {
      toast.error('Kon kortingscode niet toepassen.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDiscountFn = useCallback(async () => {
    const cartId = getCartId();
    if (!cartId) return;
    setLoading(true);
    try {
      const response = await checkoutAPI.removeDiscount(cartId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      const data = (r?.data && typeof r.data === 'object') ? r.data : r;
      setState(s => ({
        ...s,
        discount: null,
        subtotal: data?.subtotal != null ? Number(data.subtotal) : s.subtotal,
        shippingCost: data?.shipping_cost != null ? Number(data.shipping_cost) : s.shippingCost,
        total: data?.total != null ? Number(data.total) : s.total,
      }));
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  // 2-step checkout: Details & Address → Payment
  const getSteps = useCallback(() => [
    { id: 1, label: 'checkout.stepDetails' },
    { id: 2, label: 'checkout.stepPayment' },
  ], []);

  // Computed total as fallback when API total is 0
  const computedTotal = useMemo(() => {
    const sub = Number(state.subtotal) || 0;
    const ship = Number(state.shippingCost) || 0;
    const disc = Number(state.discount?.amount) || 0;
    const apiTotal = Number(state.total) || 0;
    return apiTotal > 0 ? apiTotal : Math.max(0, sub + ship - disc);
  }, [state.subtotal, state.shippingCost, state.discount, state.total]);

  const value = useMemo<CheckoutContextType>(() => ({
    ...state,
    startCheckout,
    saveCustomerAndAddress,
    completeCheckout,
    applyDiscount: applyDiscountFn,
    removeDiscount: removeDiscountFn,
    goToStep,
    getSteps,
    computedTotal,
  }), [state, startCheckout, saveCustomerAndAddress, completeCheckout, applyDiscountFn, removeDiscountFn, goToStep, getSteps, computedTotal]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
