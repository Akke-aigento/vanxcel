import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, collectionsAPI, cartAPI, settingsAPI, legalAPI } from './api';
import type { ProductsParams, AddToCartPayload, Cart } from './types';
import { getCartId } from './CartContext';

// ── Products ──

export function useProducts(params?: ProductsParams) {
  return useQuery({
    queryKey: ['sellqo', 'products', params],
    queryFn: () => productsAPI.getAll(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['sellqo', 'product', slug],
    queryFn: () => productsAPI.getOne(slug),
    enabled: !!slug,
  });
}

export function usePrefetchProduct() {
  const queryClient = useQueryClient();
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['sellqo', 'product', slug],
      queryFn: () => productsAPI.getOne(slug),
    });
  };
}

// ── Collections ──

export function useCollections() {
  return useQuery({
    queryKey: ['sellqo', 'collections'],
    queryFn: () => collectionsAPI.getAll(),
  });
}

// ── Cart ──

export function useCart() {
  const cartId = getCartId();
  return useQuery({
    queryKey: ['sellqo', 'cart', cartId],
    queryFn: () => cartAPI.get(cartId!),
    enabled: !!cartId,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: AddToCartPayload) => {
      let cartId = getCartId();
      if (!cartId) {
        const newCart = await cartAPI.create();
        cartId = newCart.id;
        setCartId(cartId);
      }
      return cartAPI.addItem(cartId, item);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['sellqo', 'cart', cart.id], cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, itemId, quantity }: { cartId: string; itemId: string; quantity: number }) =>
      cartAPI.updateItem(cartId, itemId, quantity),
    onMutate: async ({ cartId, itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['sellqo', 'cart', cartId] });
      const previous = queryClient.getQueryData<Cart>(['sellqo', 'cart', cartId]);
      if (previous) {
        queryClient.setQueryData<Cart>(['sellqo', 'cart', cartId], {
          ...previous,
          items: previous.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      }
      return { previous, cartId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['sellqo', 'cart', context.cartId], context.previous);
      }
    },
    onSettled: (_data, _err, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['sellqo', 'cart', cartId] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string }) =>
      cartAPI.removeItem(cartId, itemId),
    onMutate: async ({ cartId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['sellqo', 'cart', cartId] });
      const previous = queryClient.getQueryData<Cart>(['sellqo', 'cart', cartId]);
      if (previous) {
        queryClient.setQueryData<Cart>(['sellqo', 'cart', cartId], {
          ...previous,
          items: previous.items.filter((i) => i.id !== itemId),
          item_count: previous.item_count - 1,
        });
      }
      return { previous, cartId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['sellqo', 'cart', context.cartId], context.previous);
      }
    },
    onSettled: (_data, _err, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['sellqo', 'cart', cartId] });
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, code }: { cartId: string; code: string }) =>
      cartAPI.applyDiscount(cartId, code),
    onSuccess: (cart) => {
      queryClient.setQueryData(['sellqo', 'cart', cart.id], cart);
    },
  });
}

export function useRemoveDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId }: { cartId: string }) =>
      cartAPI.removeDiscount(cartId),
    onSuccess: (cart) => {
      queryClient.setQueryData(['sellqo', 'cart', cart.id], cart);
    },
  });
}

// ── Settings & Legal ──

export function useSettings() {
  return useQuery({
    queryKey: ['sellqo', 'settings'],
    queryFn: () => settingsAPI.get(),
  });
}

export function useLegalPages() {
  return useQuery({
    queryKey: ['sellqo', 'legal'],
    queryFn: () => legalAPI.get(),
  });
}

// Re-export for use in hooks
function setCartId(id: string) {
  if (id && id !== 'undefined' && id !== 'null') {
    localStorage.setItem('vanxcel_cart_id', id);
  }
}
