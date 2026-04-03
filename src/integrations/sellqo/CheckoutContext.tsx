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
  orderId: string | null;
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
  saveCustomer: (customer: CustomerData) => Promise<boolean>;
  saveAddress: (shipping: AddressData, billingSame: boolean, billing?: AddressData) => Promise<boolean>;
  selectShipping: (methodId: string) => Promise<boolean>;
  completeCheckout: (paymentMethodId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => Promise<void>;
  goToStep: (step: number) => void;
  getSteps: () => { id: number; label: string }[];
}

const initialState: CheckoutState = {
  orderId: null,
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

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<CheckoutState>(initialState);

  const setLoading = (loading: boolean) => setState(s => ({ ...s, isLoading: loading }));
  const clearErrors = () => setState(s => ({ ...s, fieldErrors: {}, generalError: null }));

  const handleApiError = (result: { success: boolean; error?: { code?: string; message?: string; fields?: Record<string, string> } }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;
    const error = r?.error;
    if (error?.code === 'VALIDATION_ERROR' && error?.fields) {
      setState(s => ({ ...s, fieldErrors: error.fields }));
    } else {
      const msg = error?.message || 'Er ging iets mis. Probeer het opnieuw.';
      setState(s => ({ ...s, generalError: msg }));
      toast.error(msg);
    }
  };

  const startCheckout = useCallback(async () => {
    const cartId = getStoredCartId();
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
      setState(s => ({
        ...s,
        orderId: data.order_id,
        items: data.items || [],
        availablePaymentMethods: data.available_payment_methods || [],
        availableShippingMethods: data.available_shipping_methods || [],
        subtotal: data.subtotal || 0,
        total: data.total || 0,
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

  const saveCustomer = useCallback(async (customer: CustomerData) => {
    if (!state.orderId) return false;
    setLoading(true);
    clearErrors();
    try {
      const response = await checkoutAPI.saveCustomer(state.orderId, customer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return false;
      }
      setState(s => ({ ...s, customer, currentStep: 2 }));
      return true;
    } catch (err) {
      console.error('Save customer failed:', err);
      toast.error('Kon gegevens niet opslaan.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.orderId]);

  const saveAddress = useCallback(async (shipping: AddressData, billingSame: boolean, billing?: AddressData) => {
    if (!state.orderId) return false;
    setLoading(true);
    clearErrors();
    try {
      const response = await checkoutAPI.saveAddress(state.orderId, shipping, billingSame, billing);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return false;
      }
      // Determine next step
      const hasShipping = state.availableShippingMethods.length > 0;
      let nextStep = hasShipping ? 3 : 4;
      // Auto-select if only 1 shipping method
      if (hasShipping && state.availableShippingMethods.length === 1) {
        const autoMethod = state.availableShippingMethods[0];
        try {
          await checkoutAPI.selectShipping(state.orderId, autoMethod.id);
          setState(s => ({
            ...s,
            selectedShippingMethod: autoMethod.id,
            shippingCost: autoMethod.price || 0,
          }));
        } catch { /* proceed anyway */ }
        nextStep = 4;
      }
      setState(s => ({
        ...s,
        shippingAddress: shipping,
        billingAddress: billingSame ? null : (billing || null),
        billingSameAsShipping: billingSame,
        currentStep: nextStep,
      }));
      return true;
    } catch (err) {
      console.error('Save address failed:', err);
      toast.error('Kon adres niet opslaan.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.orderId, state.availableShippingMethods]);

  const selectShippingFn = useCallback(async (methodId: string) => {
    if (!state.orderId) return false;
    setLoading(true);
    clearErrors();
    try {
      const response = await checkoutAPI.selectShipping(state.orderId, methodId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return false;
      }
      const data = r?.data || {};
      setState(s => ({
        ...s,
        selectedShippingMethod: methodId,
        shippingCost: data.shipping_cost ?? 0,
        total: data.total ?? s.total,
        currentStep: 4,
      }));
      return true;
    } catch (err) {
      console.error('Select shipping failed:', err);
      toast.error('Kon verzendmethode niet selecteren.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.orderId]);

  const completeCheckout = useCallback(async (paymentMethodId: string) => {
    if (!state.orderId) return;
    setLoading(true);
    clearErrors();
    try {
      const baseUrl = getCheckoutBaseUrl();
      const response = await checkoutAPI.complete(
        state.orderId,
        paymentMethodId,
        `${baseUrl}/bedankt`,
        `${baseUrl}/shop`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        handleApiError(r);
        return;
      }
      const data: CheckoutCompleteData = r?.data || {};
      
      // Clear cart after successful checkout
      clearStoredCartId();

      switch (data.payment_type) {
        case 'redirect':
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            toast.error('Geen betaal-URL ontvangen. Probeer het opnieuw.');
          }
          break;
        case 'manual':
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
          navigate('/bedankt', {
            state: {
              orderNumber: data.order_number,
              total: data.total,
              qrData: data.qr_data,
              paymentType: 'qr',
            },
          });
          break;
        default:
          // If payment_type is missing but checkout_url exists, redirect
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            navigate('/bedankt', {
              state: {
                orderNumber: data.order_number,
                total: data.total,
                paymentType: 'unknown',
              },
            });
          }
      }
    } catch (err) {
      console.error('Complete checkout failed:', err);
      toast.error('Betaling kon niet worden gestart. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }, [state.orderId, navigate]);

  const applyDiscountFn = useCallback(async (code: string) => {
    if (!state.orderId) return false;
    setLoading(true);
    try {
      const response = await checkoutAPI.applyDiscount(state.orderId, code);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r?.success === false) {
        const msg = r?.error?.message || 'Ongeldige kortingscode.';
        toast.error(msg);
        return false;
      }
      const data = r?.data || {};
      setState(s => ({
        ...s,
        discount: { code: data.discount_code || code, amount: data.discount_amount || 0 },
        total: data.total ?? s.total,
      }));
      return true;
    } catch {
      toast.error('Kon kortingscode niet toepassen.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.orderId]);

  const removeDiscountFn = useCallback(async () => {
    if (!state.orderId) return;
    setLoading(true);
    try {
      await checkoutAPI.removeDiscount(state.orderId);
      setState(s => ({ ...s, discount: null }));
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [state.orderId]);

  const goToStep = useCallback((step: number) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  const getSteps = useCallback(() => {
    const steps = [
      { id: 1, label: 'checkout.stepCustomer' },
      { id: 2, label: 'checkout.stepAddress' },
    ];
    if (state.availableShippingMethods.length > 1) {
      steps.push({ id: 3, label: 'checkout.stepShipping' });
    }
    steps.push({ id: 4, label: 'checkout.stepPayment' });
    return steps;
  }, [state.availableShippingMethods]);

  const value = useMemo<CheckoutContextType>(() => ({
    ...state,
    startCheckout,
    saveCustomer,
    saveAddress,
    selectShipping: selectShippingFn,
    completeCheckout,
    applyDiscount: applyDiscountFn,
    removeDiscount: removeDiscountFn,
    goToStep,
    getSteps,
  }), [state, startCheckout, saveCustomer, saveAddress, selectShippingFn, completeCheckout, applyDiscountFn, removeDiscountFn, goToStep, getSteps]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
