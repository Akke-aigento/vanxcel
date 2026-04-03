
## Fix: Checkout order_id → cart_id + Stripe polling + discount UI

### Overzicht
De SellQo API is gewijzigd: alle checkout-stappen werken nu op `cart_id` i.p.v. `order_id`. Daarnaast moet de success URL een `{CHECKOUT_SESSION_ID}` placeholder bevatten en moet de bedankt-pagina pollen voor de order na Stripe redirect.

### Wijzigingen

**1. `src/integrations/sellqo/api.ts`** — Vervang `order_id` door `cart_id` in alle checkout methods:
- `saveCustomer(cartId, customer)` → body: `{ cart_id, customer }`
- `saveAddress(cartId, ...)` → body: `{ cart_id, shipping_address, ... }`
- `selectShipping(cartId, methodId)` → body: `{ cart_id, shipping_method_id }`
- `complete(cartId, paymentMethodId, successUrl, cancelUrl)` → body: `{ cart_id, ... }`
- `applyDiscount(cartId, code)` → body: `{ cart_id, discount_code }`
- `removeDiscount(cartId)` → body: `{ cart_id }`
- Nieuw: `getOrderBySession(stripeSessionId)` → GET `/checkout/order?stripe_session_id=...`

**2. `src/integrations/sellqo/CheckoutContext.tsx`** — Grote refactor:
- Verwijder `orderId` uit state, gebruik `getStoredCartId()` direct
- Alle methods gebruiken `cartId` i.p.v. `state.orderId`
- `completeCheckout`: success_url met `{CHECKOUT_SESSION_ID}` placeholder
- Cart NIET legen bij Stripe redirect (dat doet de bedankt-pagina)
- Cart WEL legen bij manual/qr

**3. `src/pages/Checkout.tsx`** — Check op `cartId` i.p.v. `orderId` voor loading state

**4. `src/pages/ThankYou.tsx`** — Stripe polling toevoegen:
- Bij `session_id` in URL: poll `/checkout/order?stripe_session_id=...` (max 5 pogingen, 2s interval)
- Na succesvolle poll: toon ordernummer + maak cart leeg
- Bij timeout: toon generiek bedankbericht + maak cart leeg

**5. `supabase/functions/sellqo-proxy/index.ts`** — Nieuwe route:
- GET `/checkout/order?stripe_session_id=...` → action `checkout_get_order`

### Bestanden (6)
- `src/integrations/sellqo/api.ts`
- `src/integrations/sellqo/CheckoutContext.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/ThankYou.tsx`
- `supabase/functions/sellqo-proxy/index.ts`

### Resultaat
- Checkout werkt met cart_id door de hele flow
- Stripe redirect bevat session ID placeholder
- Bedankt-pagina pollt voor ordergegevens na Stripe betaling
- Kortingscode UI is al aanwezig in OrderSummary (geen wijziging nodig)
