

## QR Betaling tusschenpagina

### Wat
Een nieuwe pagina `/checkout/qr-betaling` die na QR-betaalkeuze een groot QR-scherm toont met instructies, bankgegevens als fallback, en een "Ik heb betaald" knop die naar `/bedankt` navigeert.

### Wijzigingen

**1. `src/pages/QRPayment.tsx`** — Nieuwe pagina
- Leest `location.state` (orderNumber, total, currency, qrData, bankDetails) via `useRef` (zelfde patroon als ThankYou)
- Genereert EPC QR-code uit `qrData.payload` met de `qrcode` npm package (of toont `qrData.image_url` als fallback)
- Layout: grote QR-code gecentreerd, bedrag + bestelnummer, stap-voor-stap instructies (1. Open bankapp, 2. Scan QR, 3. Bevestig betaling), bankgegevens als fallback sectie, "Ik heb betaald" knop → `navigate('/bedankt', { state: { paymentType: 'qr', orderNumber, total, currency } })`
- Navbar + Footer omvatten de pagina
- Geen cart clear hier — dat gebeurt op /bedankt

**2. `src/integrations/sellqo/CheckoutContext.tsx`** — Regel 253-262
- `case 'qr'`: navigeer naar `/checkout/qr-betaling` i.p.v. `/bedankt`
- Verwijder `clearStoredCartId()` uit deze case (cart clear verplaatst naar ThankYou na "Ik heb betaald")
- Voeg `currency` en `bankDetails` toe aan de state

**3. `src/App.tsx`** — Route toevoegen
- `<Route path="/checkout/qr-betaling" element={<QRPayment />} />`
- Import QRPayment

**4. Package** — `qrcode.react` installeren voor client-side QR rendering uit EPC payload

### Bestanden (3 + 1 dependency)
- `src/pages/QRPayment.tsx` (nieuw)
- `src/integrations/sellqo/CheckoutContext.tsx` (edit)
- `src/App.tsx` (edit)
- `npm install qrcode.react`

