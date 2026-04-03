import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsAPI, collectionsAPI, cartAPI, checkoutAPI, settingsAPI, legalAPI } from './api';
import { extractArray, extractSingle } from './client';
import { normalizeCart } from './normalizer';
import type { Cart, ProductsParams } from './types';

// === QUERY KEYS ===
export const sellqoKeys = {
  products: {
    all: ['sellqo', 'products'] as const,
    list: (params?: ProductsParams) => ['sellqo', 'products', 'list', params] as const,
    detail: (slug: string) => ['sellqo', 'products', 'detail', slug] as const,
    related: (slug: string) => ['sellqo', 'products', 'related', slug] as const,
  },
  collections: {
    all: ['sellqo', 'collections'] as const,
  },
  cart: (cartId: string) => ['sellqo', 'cart', cartId] as const,
  settings: {
    all: ['sellqo', 'settings'] as const,
  },
  legal: ['sellqo', 'legal'] as const,
};

// === CART STORAGE ===
const CART_STORAGE_KEY = 'vanxcel_cart_id';

function isValidCartId(id: string | null): id is string {
  return !!id && id !== 'undefined' && id !== 'null' && id.trim() !== '';
}

export function getStoredCartId(): string | null {
  try {
    const id = localStorage.getItem(CART_STORAGE_KEY);
    if (!isValidCartId(id)) {
      if (id !== null) localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    return id;
  } catch {
    return null;
  }
}

function storeCartId(cartId: string) {
  if (!isValidCartId(cartId)) return;
  try { localStorage.setItem(CART_STORAGE_KEY, cartId); } catch { /* noop */ }
}

export function clearStoredCartId() {
  try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* noop */ }
}

// === PRODUCT HOOKS ===
export function useProducts(params?: ProductsParams) {
  return useQuery({
    queryKey: sellqoKeys.products.list(params),
    queryFn: () => productsAPI.getAll(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.products.detail(slug),
    queryFn: () => productsAPI.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.products.related(slug),
    queryFn: () => productsAPI.getRelated(slug),
    enabled: !!slug,
  });
}

// === COLLECTION HOOKS ===
export function useCollections() {
  return useQuery({
    queryKey: sellqoKeys.collections.all,
    queryFn: collectionsAPI.getAll,
  });
}

// === CART HOOKS ===
export function useCartQuery() {
  const cartId = getStoredCartId();
  return useQuery({
    queryKey: sellqoKeys.cart(cartId || ''),
    queryFn: async () => {
      const result = await cartAPI.get(cartId!);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    enabled: !!cartId,
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await cartAPI.create();
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onSuccess: (cart) => {
      storeCartId(cart.id);
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const createCart = useCreateCart();

  return useMutation({
    mutationFn: async (item: { product_id: string; variant_id?: string; quantity: number }) => {
      let activeCartId = getStoredCartId();
      if (!activeCartId) {
        const newCart = await createCart.mutateAsync();
        activeCartId = newCart.id;
      }
      const result = await cartAPI.addItem(activeCartId, item);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = await cartAPI.updateItem(cartId, itemId, quantity);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onMutate: async ({ itemId, quantity }) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      await queryClient.cancelQueries({ queryKey: sellqoKeys.cart(cartId) });
      const previousCart = queryClient.getQueryData<Cart>(sellqoKeys.cart(cartId));
      if (previousCart) {
        queryClient.setQueryData<Cart>(sellqoKeys.cart(cartId), {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      }
      return { previousCart, cartId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart && context.cartId) {
        queryClient.setQueryData(sellqoKeys.cart(context.cartId), context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
    onSettled: () => {
      const cartId = getStoredCartId();
      if (cartId) queryClient.invalidateQueries({ queryKey: sellqoKeys.cart(cartId) });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = await cartAPI.removeItem(cartId, itemId);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onMutate: async (itemId) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      await queryClient.cancelQueries({ queryKey: sellqoKeys.cart(cartId) });
      const previousCart = queryClient.getQueryData<Cart>(sellqoKeys.cart(cartId));
      if (previousCart) {
        const newItems = previousCart.items.filter(item => item.id !== itemId);
        queryClient.setQueryData<Cart>(sellqoKeys.cart(cartId), {
          ...previousCart,
          items: newItems,
          item_count: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      }
      return { previousCart, cartId };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart && context.cartId) {
        queryClient.setQueryData(sellqoKeys.cart(context.cartId), context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
    onSettled: () => {
      const cartId = getStoredCartId();
      if (cartId) queryClient.invalidateQueries({ queryKey: sellqoKeys.cart(cartId) });
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = code
        ? await cartAPI.applyDiscount(cartId, code)
        : await cartAPI.removeDiscount(cartId);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

// === CHECKOUT HOOKS ===
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (options?: { success_url?: string; cancel_url?: string }) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const response = await checkoutAPI.create(cartId, options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      // Check for explicit API failure
      if (r?.success === false) {
        const errMsg = typeof r.error === 'string' ? r.error : JSON.stringify(r.error);
        throw new Error(`Checkout failed: ${errMsg}`);
      }
      const url = r?.data?.checkout_url || r?.checkout_url;
      if (!url) {
        console.error('[checkout] No checkout_url in response:', JSON.stringify(r));
        throw new Error('No checkout URL returned');
      }
      return url as string;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error('Afrekenen is momenteel niet beschikbaar. Probeer het later opnieuw.');
    },
  });
}

// === SETTINGS ===
export function useSettings() {
  return useQuery({
    queryKey: sellqoKeys.settings.all,
    queryFn: settingsAPI.getAll,
  });
}

export function useLegalPages() {
  return useQuery({
    queryKey: sellqoKeys.legal,
    queryFn: legalAPI.getAll,
  });
}
