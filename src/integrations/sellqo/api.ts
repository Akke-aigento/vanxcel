import { sellqoFetch } from './client';
import type {
  Product,
  Cart,
  Collection,
  ProductsParams,
  StoreSettings,
  CheckoutStartData,
  CheckoutCompleteData,
  CustomerData,
  AddressData,
} from './types';

// === PRODUCTS ===
export const productsAPI = {
  getAll: (params?: ProductsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.collection) searchParams.set('collection', params.collection);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    const qs = searchParams.toString();
    return sellqoFetch<{ data: { products: Product[]; pagination: unknown } }>(`/products${qs ? `?${qs}` : ''}`);
  },

  getBySlug: (slug: string) =>
    sellqoFetch<{ data: Product }>(`/products/${slug}`),

  getRelated: (slug: string, limit = 4) =>
    sellqoFetch<Product[]>(`/products/${slug}/related?limit=${limit}`),
};

// === COLLECTIONS ===
export const collectionsAPI = {
  getAll: () =>
    sellqoFetch<{ data: Collection[] }>('/collections'),
};

// === CART ===
export const cartAPI = {
  create: () => {
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return sellqoFetch<Cart>('/cart', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  get: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}`),

  addItem: (cartId: string, item: { product_id: string; variant_id?: string; quantity: number }) => {
    const body: Record<string, unknown> = { product_id: item.product_id, quantity: item.quantity };
    if (item.variant_id) body.variant_id = item.variant_id;
    return sellqoFetch<Cart>(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateItem: (cartId: string, itemId: string, quantity: number) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (cartId: string, itemId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, { method: 'DELETE' }),

  applyDiscount: (cartId: string, code: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  removeDiscount: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, { method: 'DELETE' }),
};

// === CHECKOUT (multi-step, cart_id based) ===
export const checkoutAPI = {
  /** Countries the shop ships to (public, no cart needed; proxy maps to get_shipping_countries) */
  getShippingCountries: () =>
    sellqoFetch<{
      success?: boolean;
      data?: { countries: string[]; unrestricted: boolean; default_country: string | null };
      countries?: string[];
      unrestricted?: boolean;
      default_country?: string | null;
    }>('/get_shipping_countries', { method: 'POST', body: JSON.stringify({}) }),

  /** Start checkout — returns available methods + items */

  start: (cartId: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutStartData }>('/checkout/start', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    }),

  /** Save customer details */
  saveCustomer: (cartId: string, customer: CustomerData) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/customer', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, customer }),
    }),

  /** Save shipping + billing address */
  saveAddress: (cartId: string, shippingAddress: AddressData, billingSameAsShipping: boolean, billingAddress?: AddressData) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/address', {
      method: 'POST',
      body: JSON.stringify({
        cart_id: cartId,
        shipping_address: shippingAddress,
        billing_same_as_shipping: billingSameAsShipping,
        billing_address: billingSameAsShipping ? null : billingAddress,
      }),
    }),

  /** Select shipping method */
  selectShipping: (cartId: string, shippingMethodId: string) =>
    sellqoFetch<{ success: boolean; data: { shipping_cost: number; total: number } }>('/checkout/shipping', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, shipping_method_id: shippingMethodId }),
    }),

  /** Complete checkout — returns payment redirect or confirmation */
  complete: (cartId: string, paymentMethodId: string, successUrl: string, cancelUrl: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutCompleteData }>('/checkout/complete', {
      method: 'POST',
      body: JSON.stringify({
        cart_id: cartId,
        payment_method_id: paymentMethodId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    }),

  /** Apply discount code */
  applyDiscount: (cartId: string, discountCode: string) =>
    sellqoFetch<{
      cart_id?: string;
      currency?: string;
      subtotal?: number;
      shipping_cost?: number;
      applied_discounts?: Array<{ code: string; description?: string; amount: number }>;
      discount_total?: number;
      total?: number;
    }>('/checkout/discount', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, discount_code: discountCode }),
    }),

  /** Remove discount code */
  removeDiscount: (cartId: string) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/discount', {
      method: 'DELETE',
      body: JSON.stringify({ cart_id: cartId }),
    }),

  /** Validate an EU VAT number via VIES (proxy fallback maps this to action checkout_validate_vat) */
  validateVat: (vatNumber: string) =>
    sellqoFetch<{
      valid?: boolean;
      company_name?: string | null;
      address?: string | null;
      country_code?: string;
      cached?: boolean;
      success?: boolean;
      error?: { code: string; message: string };
    }>('/checkout/validate_vat', {
      method: 'POST',
      body: JSON.stringify({ vat_number: vatNumber }),
    }),

  /** Get order by Stripe session ID (for thank-you page polling) */
  getOrderBySession: (stripeSessionId: string) =>
    sellqoFetch<{ success: boolean; data: { order_number: string; total: number; currency: string; status: string } }>(
      `/checkout/order?stripe_session_id=${encodeURIComponent(stripeSessionId)}`
    ),

  /** Legacy: create checkout (for backward compat) */
  create: (cartId: string, options?: { success_url?: string; cancel_url?: string }) =>
    sellqoFetch<{ data: { checkout_url: string } }>('/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, ...options }),
    }),
};

// === SETTINGS ===
export const settingsAPI = {
  getAll: () =>
    sellqoFetch<{ data: StoreSettings }>('/settings'),
};

// === LEGAL ===
export const legalAPI = {
  getAll: () =>
    sellqoFetch<{ data: { title: string; url: string; slug: string }[] }>('/legal'),
};
