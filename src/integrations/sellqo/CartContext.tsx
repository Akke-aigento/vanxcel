import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartQuery, useAddToCart, useUpdateCartItem, useRemoveCartItem, useCreateCheckout, clearStoredCartId, getStoredCartId, sellqoKeys } from './hooks';
import type { Cart, CartItem } from './types';

interface CartContextType {
  cart: Cart | undefined;
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: { product_id: string; variant_id?: string; quantity: number; title: string; variant_title?: string; price: number; image?: string }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (options?: { success_url?: string; cancel_url?: string }) => Promise<void>;
  clearCart: () => void;
  isAddingItem: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: cart, isLoading } = useCartQuery();
  const addToCartMutation = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const createCheckout = useCreateCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (item: { product_id: string; variant_id?: string; quantity: number; title: string; variant_title?: string; price: number; image?: string }) => {
    try {
      await addToCartMutation.mutateAsync({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Add to cart failed:', error);
      const { toast } = await import('sonner');
      toast.error('Er ging iets mis bij het toevoegen aan je winkelwagen.');
    }
  }, [addToCartMutation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeCartItem.mutateAsync(itemId);
      } else {
        await updateItem.mutateAsync({ itemId, quantity });
      }
    } catch (error) {
      console.error('Update quantity failed:', error);
      const { toast } = await import('sonner');
      toast.error('Kon hoeveelheid niet aanpassen.');
    }
  }, [updateItem, removeCartItem]);

  const removeItemFn = useCallback(async (itemId: string) => {
    try {
      await removeCartItem.mutateAsync(itemId);
    } catch (error) {
      console.error('Remove item failed:', error);
      const { toast } = await import('sonner');
      toast.error('Kon item niet verwijderen.');
    }
  }, [removeCartItem]);

  const doCheckout = useCallback(async (options?: { success_url?: string; cancel_url?: string }) => {
    await createCheckout.mutateAsync(options);
  }, [createCheckout]);

  const clearCart = useCallback(() => {
    const oldCartId = getStoredCartId();
    clearStoredCartId();
    if (oldCartId) {
      queryClient.setQueryData(sellqoKeys.cart(oldCartId), undefined);
      queryClient.removeQueries({ queryKey: sellqoKeys.cart(oldCartId) });
    }
  }, [queryClient]);

  const items = cart?.items || [];
  const itemCount = cart?.item_count || items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;

  const value = useMemo<CartContextType>(() => ({
    cart,
    items,
    isLoading,
    isOpen,
    itemCount,
    subtotal,
    total,
    openCart,
    closeCart,
    addItem,
    updateQuantity,
    removeItem: removeItemFn,
    checkout: doCheckout,
    clearCart,
    isAddingItem: addToCartMutation.isPending,
  }), [cart, items, isLoading, isOpen, itemCount, subtotal, total, openCart, closeCart, addItem, updateQuantity, removeItemFn, doCheckout, clearCart, addToCartMutation.isPending]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
