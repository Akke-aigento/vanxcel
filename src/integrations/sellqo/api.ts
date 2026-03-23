import { sellqoFetch } from './client';
import type {
  Product,
  Cart,
  Collection,
  ProductsParams,
  StoreSettings,
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
  create: () =>
    sellqoFetch<Cart>('/cart', { method: 'POST' }),

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

// === CHECKOUT ===
export const checkoutAPI = {
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
