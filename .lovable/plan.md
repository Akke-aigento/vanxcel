

## Checkout Flow Implementation

### 1. Create CartDrawer component — `src/components/CartDrawer.tsx`

A slide-out drawer (using the existing `Drawer` UI component) triggered by the cart icon in the Navbar:
- Shows cart items with name, image, quantity, unit price
- Quantity +/- controls using `updateItem` and `removeItem` from `useCartContext()`
- Subtotal/total display
- "Afrekenen" button that calls `sellqoFetch('/checkout', ...)` with `cart_id`, `success_url`, and `cancel_url`, then redirects to the returned `checkout_url`
- Empty state when no items

Note: `sellqoFetch` already parses JSON, so the checkout call will be:
```ts
const response = await sellqoFetch<{ data: { checkout_url: string } }>('/checkout', {
  method: 'POST',
  body: JSON.stringify({
    cart_id: cartId,
    success_url: 'https://www.vanxcel.be/bedankt?cart_id=' + cartId,
    cancel_url: 'https://www.vanxcel.be/shop',
  }),
});
window.location.href = response.data.checkout_url;
```

### 2. Update Navbar — `src/components/Navbar.tsx`

Replace the external cart link with the CartDrawer trigger:
- Import `CartDrawer` and `useCartContext`
- Show item count badge on the cart icon
- Cart icon opens the drawer instead of linking to vanxcel.be/cart

### 3. Create ThankYou page — `src/pages/ThankYou.tsx`

- Read `cart_id` from `useSearchParams()`
- Fetch cart data via `sellqoFetch('/cart/' + cartId)` in a `useEffect`
- Display order summary: product names, quantities, prices, total
- Call `clearCart()` from `useCartContext()` on mount to clear localStorage
- Show thank-you message and a link back to `/`

### 4. Add route — `src/App.tsx`

Add `<Route path="/bedankt" element={<ThankYou />} />` above the catch-all route.

