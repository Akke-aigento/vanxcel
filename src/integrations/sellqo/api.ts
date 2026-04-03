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

// === CHECKOUT (multi-step) ===
export const checkoutAPI = {
  /** Start checkout — returns order_id + available methods */
  start: (cartId: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutStartData }>('/checkout/start', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    }),

  /** Save customer details */
  saveCustomer: (orderId: string, customer: CustomerData) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/customer', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, customer }),
    }),

  /** Save shipping + billing address */
  saveAddress: (orderId: string, shippingAddress: AddressData, billingSameAsShipping: boolean, billingAddress?: AddressData) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/address', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        shipping_address: shippingAddress,
        billing_same_as_shipping: billingSameAsShipping,
        billing_address: billingSameAsShipping ? null : billingAddress,
      }),
    }),

  /** Select shipping method */
  selectShipping: (orderId: string, shippingMethodId: string) =>
    sellqoFetch<{ success: boolean; data: { shipping_cost: number; total: number } }>('/checkout/shipping', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, shipping_method_id: shippingMethodId }),
    }),

  /** Complete checkout — returns payment redirect or confirmation */
  complete: (orderId: string, paymentMethodId: string, successUrl: string, cancelUrl: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutCompleteData }>('/checkout/complete', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payment_method_id: paymentMethodId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    }),

  /** Apply discount code */
  applyDiscount: (orderId: string, discountCode: string) =>
    sellqoFetch<{ success: boolean; data: { discount_code: string; discount_amount: number; total: number } }>('/checkout/discount', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, discount_code: discountCode }),
    }),

  /** Remove discount code */
  removeDiscount: (orderId: string) =>
    sellqoFetch<{ success: boolean; data: unknown }>('/checkout/discount', {
      method: 'DELETE',
      body: JSON.stringify({ order_id: orderId }),
    }),

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
