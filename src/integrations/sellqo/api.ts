import { sellqoFetch } from './client';
import type {
  Product,
  Cart,
  Collection,
  ProductsParams,
  AddToCartPayload,
  CheckoutPayload,
  StoreSettings,
  LegalPages,
} from './types';

function toQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (!entries.length) return '';
  return '?' + new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  ).toString();
}

export const productsAPI = {
  getAll: (params?: ProductsParams) =>
    sellqoFetch<Product[]>(`/products${toQueryString(params as Record<string, unknown>)}`),

  getOne: (slug: string) =>
    sellqoFetch<Product>(`/products/${slug}`),
};

export const collectionsAPI = {
  getAll: () =>
    sellqoFetch<Collection[]>('/collections'),
};

export const cartAPI = {
  get: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}`),

  create: () =>
    sellqoFetch<Cart>('/cart', { method: 'POST' }),

  addItem: (cartId: string, item: AddToCartPayload) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (cartId: string, itemId: string, quantity: number) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (cartId: string, itemId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  applyDiscount: (cartId: string, code: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  removeDiscount: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, {
      method: 'DELETE',
    }),

  checkout: (cartId: string, successUrl: string, cancelUrl: string) =>
    sellqoFetch<{ checkout_url: string }>('/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, success_url: successUrl, cancel_url: cancelUrl } as CheckoutPayload & { cart_id: string }),
    }),
};

export const settingsAPI = {
  get: () =>
    sellqoFetch<StoreSettings>('/settings'),
};

export const legalAPI = {
  get: () =>
    sellqoFetch<LegalPages>('/legal'),
};
