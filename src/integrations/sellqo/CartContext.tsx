import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem } from './hooks';
import type { Cart, AddToCartPayload } from './types';

const CART_STORAGE_KEY = 'vanxcel_cart_id';

// ── localStorage helpers (exported for hooks) ──

export function getCartId(): string | null {
  try {
    const id = localStorage.getItem(CART_STORAGE_KEY);
    if (id && id !== 'undefined' && id !== 'null') return id;
    return null;
  } catch {
    return null;
  }
}

export function setCartId(id: string) {
  if (id && id !== 'undefined' && id !== 'null') {
    localStorage.setItem(CART_STORAGE_KEY, id);
  }
}

function clearCartId() {
  localStorage.removeItem(CART_STORAGE_KEY);
}

// ── Context ──

interface CartContextValue {
  cart: Cart | undefined;
  isLoading: boolean;
  addItem: (payload: AddToCartPayload) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isAddingItem: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useCart();
  const addToCartMutation = useAddToCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

  const addItem = useCallback(
    (payload: AddToCartPayload) => {
      addToCartMutation.mutate(payload);
    },
    [addToCartMutation]
  );

  const updateItem = useCallback(
    (itemId: string, quantity: number) => {
      const cartId = getCartId();
      if (!cartId) return;
      updateItemMutation.mutate({ cartId, itemId, quantity });
    },
    [updateItemMutation]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const cartId = getCartId();
      if (!cartId) return;
      removeItemMutation.mutate({ cartId, itemId });
    },
    [removeItemMutation]
  );

  const clearCart = useCallback(() => {
    const cartId = getCartId();
    clearCartId();
    if (cartId) {
      queryClient.removeQueries({ queryKey: ['sellqo', 'cart', cartId] });
    }
  }, [queryClient]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      isAddingItem: addToCartMutation.isPending,
    }),
    [cart, isLoading, addItem, updateItem, removeItem, clearCart, addToCartMutation.isPending]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
