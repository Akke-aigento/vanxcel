

## SellQo Headless Commerce Integration

### What We're Building

A complete SellQo commerce integration layer: a proxy edge function + frontend client, types, API wrappers, React Query hooks, and a CartContext provider.

### Files to Create/Edit

**1. Edge Function — `supabase/functions/sellqo-proxy/index.ts`**
- Proxy that forwards requests to SellQo's storefront API
- Reads `SELLQO_API_URL` and `SELLQO_API_KEY` from environment secrets
- Passes through `X-Tenant-ID` header from the client
- Full CORS support
- Routes: strips `/sellqo-proxy` prefix and forwards path + method + body to SellQo API
- Returns SellQo response as-is (status, JSON body)

**2. `supabase/config.toml`** — add `[functions.sellqo-proxy]` with `verify_jwt = false` (public storefront API)

**3. `src/integrations/sellqo/types.ts`** — TypeScript types for Product, CartItem, Cart, Collection, ProductVariant, ProductImage, and API parameter types

**4. `src/integrations/sellqo/client.ts`** — `sellqoFetch()` helper that hits the proxy URL with `X-Tenant-ID: vanxcel` header, plus JSON response parsing and error handling

**5. `src/integrations/sellqo/api.ts`** — API modules:
- `productsAPI` — getAll, getOne
- `collectionsAPI` — getAll
- `cartAPI` — get, create, addItem, updateItem, removeItem, applyDiscount, removeDiscount, checkout
- `settingsAPI` — get
- `legalAPI` — get

**6. `src/integrations/sellqo/hooks.ts`** — React Query hooks:
- `useProducts`, `useProduct` (with prefetch on hover via queryClient.prefetchQuery)
- `useCollections`
- `useCart` (reads cart_id from localStorage)
- `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` (mutations with optimistic updates + cache invalidation)
- `useApplyDiscount`, `useSettings`, `useLegalPages`

**7. `src/integrations/sellqo/CartContext.tsx`** — React context provider:
- Manages `cart_id` in localStorage with validation (no "undefined"/"null")
- Exposes cart state + addItem/updateItem/removeItem/clearCart
- Auto-creates cart on first addItem if none exists

**8. `src/App.tsx`** — Wrap app in `CartProvider`, update QueryClient config with staleTime/gcTime/refetchOnWindowFocus/refetchOnMount

### Secrets Required

Before the edge function can work, two secrets need to be added:
- `SELLQO_API_URL` — base URL of the SellQo storefront API
- `SELLQO_API_KEY` — API key for authentication

### Technical Notes

- The proxy edge function is public (no JWT) since it serves storefront data
- Cart mutations use optimistic updates: update cache immediately, rollback on error
- `cart_id` localStorage key: `vanxcel_cart_id`
- The proxy constructs the full URL as `${SELLQO_API_URL}${path}` and forwards method, headers, and body

