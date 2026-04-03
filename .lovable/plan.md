

## Fix: Checkout bugs — 8 fixes in 2 bestanden

### Overzicht

De checkout heeft 8 bugs. De fixes zijn geconcentreerd in 2 hoofdbestanden + de context.

### Wijzigingen

**1. `src/integrations/sellqo/CheckoutContext.tsx`** — Stappen samenvoegen + nieuwe methode

- `getSteps()`: wijzig naar 2 stappen: `{ id: 1, label: "checkout.stepDetails" }` en `{ id: 2, label: "checkout.stepPayment" }`
- Nieuwe methode `saveCustomerAndAddress(customer, shipping, billingSame, billing?)`: combineert `saveCustomer` + `saveAddress` + auto-shipping in één flow, gaat naar stap 2
- `completeCheckout`: verwijder de `default` case die naar `/bedankt` navigeert zonder success check — bij onbekend payment_type: toon error, NIET navigeren
- `startCheckout`: parse `data.items` met fallback voor `price` → `Number(item.unit_price || item.line_total || item.price || 0)`
- Voeg `computedTotal` toe als useMemo: `Math.max(0, subtotal + shippingCost - (discount?.amount || 0))`, gebruik als fallback wanneer `total === 0`

**2. `src/pages/Checkout.tsx`** — Grote UI refactor

- **Verwijder** `StepCustomer` en `StepAddress` als aparte componenten
- **Nieuw** `StepDetailsAndAddress`: combineert klantgegevens + adres in 1 formulier. Bij submit: roept `saveCustomerAndAddress()` aan (sequential API calls in context)
- **Verwijder** `StepShipping` component (wordt automatisch afgehandeld in context)
- **StepPayment** aanpassen:
  - Filter QR methode weg op mobiel/tablet (`ontouchstart` check + `window.innerWidth < 1024`)
  - Sorteer methodes: `qr_transfer` eerst, dan `bank_transfer`, dan `stripe`
  - QR methode: toon als "Scan QR code met je bankapp" + "Gratis — direct betalen via je bankapp" + groene badge "Geen transactiekosten"
  - Stripe methode: toon badges (iDEAL, Bancontact, Creditcard, Apple Pay)
  - `prevStep` wordt altijd `1` (geen shipping stap meer)
- **OrderSummary** aanpassen:
  - Item prijs: `Number(item.price) || Number(item.unit_price) || Number(item.line_total) || 0` — voorkom NaN
  - Totaal: gebruik `computedTotal` fallback als `total === 0`
- **CheckoutContent**: verwijder `currentStep === 2` (StepAddress) en `currentStep === 3` (StepShipping). Stap 1 = details+adres, stap 2 = betaling
- **StepIndicator**: toont nu 2 stappen

**3. `src/pages/ThankYou.tsx`** — QR weergave verbeteren

- QR sectie: voeg `orderNumber` toe + duidelijkere instructietekst "Open je bankapp, scan de QR code, en bevestig de betaling"

**4. i18n bestanden** (`nl.json`, `en.json`, `de.json`, `fr.json`)

- Nieuwe key `checkout.stepDetails`: "Gegevens & Adres" / "Details & Address" / etc.
- Verwijder `checkout.stepCustomer` en `checkout.stepAddress` (of laat staan als fallback)

### Samenvatting bugs → fixes

| Bug | Fix |
|-----|-----|
| 1. 3 stappen | 2 stappen: Gegevens&Adres + Betaling |
| 2. QR volgorde/naam | QR eerst, hernoemd, alleen desktop |
| 3. QR niet getoond | Al aanwezig in ThankYou, kleine verbetering |
| 4. Totaal €0.00 | computedTotal fallback |
| 5. NaN in overzicht | Number() fallbacks op item.price |
| 6. Succes bij fout | default case toont error i.p.v. navigeren |
| 7. Stripe opties | Badges tonen (iDEAL, Bancontact, etc.) |
| 8. Kortingscode UI | Al aanwezig in OrderSummary (geen wijziging) |

### Bestanden (6)
- `src/integrations/sellqo/CheckoutContext.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/ThankYou.tsx`
- `src/i18n/locales/nl.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/de.json`
- `src/i18n/locales/fr.json`

