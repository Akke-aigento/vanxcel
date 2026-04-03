

## Volledige Multi-Step Checkout Flow Bouwen

### Probleem
De huidige code roept `/checkout` (= `checkout_start`) aan en verwacht direct een `checkout_url` terug. Maar volgens de SellQo documentatie is checkout een **multi-step flow**:

1. `checkout_start` → retourneert `order_id` + beschikbare betaal/verzendmethodes
2. `checkout/customer` → klantgegevens opslaan
3. `checkout/address` → adres opslaan
4. `checkout/shipping` → verzendmethode kiezen (optioneel)
5. `checkout/complete` → betaling starten → **hier** komt pas de `checkout_url` (bij Stripe)

### Wat er gebouwd moet worden

**1. Proxy uitbreiden** (`supabase/functions/sellqo-proxy/index.ts`)
- Nieuwe routes toevoegen: `checkout/customer`, `checkout/address`, `checkout/shipping`, `checkout/complete`, `checkout/discount`
- Mappen naar SellQo actions

**2. API laag uitbreiden** (`src/integrations/sellqo/api.ts`)
- `checkoutAPI` uitbreiden met: `start`, `saveCustomer`, `saveAddress`, `selectShipping`, `complete`, `applyDiscount`, `removeDiscount`

**3. Types uitbreiden** (`src/integrations/sellqo/types.ts`)
- `CheckoutData` interface (order_id, items, payment_methods, shipping_methods, totalen)
- `PaymentMethod`, `ShippingMethod` interfaces

**4. Checkout Context** (`src/integrations/sellqo/CheckoutContext.tsx`)
- State management voor de hele checkout flow
- Huidige stap, order data, errors, loading states

**5. Checkout pagina** (`src/pages/Checkout.tsx`)
- Multi-step formulier met 4 stappen:
  - **Stap 1**: Email, voornaam, achternaam, telefoon
  - **Stap 2**: Adres + "factuuradres zelfde" checkbox
  - **Stap 3**: Verzendmethode (skip als leeg, auto-select als 1)
  - **Stap 4**: Betaalmethode kiezen + "Bestelling plaatsen" knop
- Zijbalk met order samenvatting + kortingscode invoer
- Responsive: sidebar boven op mobile, naast op desktop

**6. CartDrawer aanpassen** (`src/components/CartDrawer.tsx`)
- "Afrekenen" knop navigeert naar `/checkout` i.p.v. direct API aan te roepen

**7. Bedankt pagina uitbreiden** (`src/pages/ThankYou.tsx`)
- 3 varianten: Stripe (redirect terug), bankoverschrijving (bankgegevens tonen), QR
- Cart legen na succes

**8. Route toevoegen** (`src/App.tsx`)
- `/checkout` route

**9. i18n** — checkout labels toevoegen aan nl/en/de/fr JSON bestanden

### Bestanden
- `supabase/functions/sellqo-proxy/index.ts` — proxy routes uitbreiden
- `src/integrations/sellqo/api.ts` — checkout API methods
- `src/integrations/sellqo/types.ts` — nieuwe interfaces
- `src/integrations/sellqo/CheckoutContext.tsx` — nieuw
- `src/pages/Checkout.tsx` — nieuw (multi-step checkout pagina)
- `src/components/CartDrawer.tsx` — navigeer naar /checkout
- `src/pages/ThankYou.tsx` — 3 betaalvarianten
- `src/App.tsx` — route toevoegen
- `src/i18n/locales/nl.json`, `en.json`, `de.json`, `fr.json` — checkout labels

### Verwacht resultaat
- Klant klikt "Afrekenen" → gaat naar `/checkout`
- Vult gegevens in stap voor stap
- Bij Stripe: redirect naar Stripe, dan terug naar `/bedankt`
- Bij bankoverschrijving: direct naar `/bedankt` met bankgegevens
- Bij QR: direct naar `/bedankt` met QR code

