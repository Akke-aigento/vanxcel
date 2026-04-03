

## Fix: Checkout knop blijft hangen op "Even geduld..."

### Root cause

Er zijn twee problemen:

1. **Upstream API fout**: De SellQo `checkout_start` action retourneert een error (`{"success":false,"error":"[object Object]"}`). Dit is een upstream API-probleem.

2. **Frontend hangt**: Zelfs als de checkout faalt, blijft de knop op "Even geduld..." hangen. De `handleCheckout` functie in `CartDrawer.tsx` heeft alleen een `catch` — geen `finally`. Als de API een 200 retourneert met `{"success":false}` (zonder checkout_url), dan:
   - `sellqoFetch` gooit geen error (status is 200)
   - `onSuccess` in `useCreateCheckout` zoekt naar `checkout_url`, vindt die niet, doet niets
   - `handleCheckout` await resolved zonder error, maar `setCheckingOut(false)` zit alleen in de `catch` → knop blijft voor eeuwig laden

### Oplossing

**Bestand 1: `src/components/CartDrawer.tsx`** (regel 21-31)

- Voeg `finally { setCheckingOut(false); }` toe zodat de knop altijd reset
- Dit vangt alle scenario's: netwerk-error, upstream-error, of success-zonder-redirect

**Bestand 2: `src/integrations/sellqo/hooks.ts`** (regel 237-251)

- In `useCreateCheckout` → `onSuccess`: als er geen `checkout_url` in de response zit, gooi een error met een duidelijke melding zodat de gebruiker feedback krijgt
- Voeg `onError` toe die een toast toont: "Afrekenen is momenteel niet beschikbaar"

### Resultaat
- Knop reset altijd na een checkout-poging
- Gebruiker krijgt een foutmelding als checkout faalt, i.p.v. eindeloos laden
- Zodra de upstream API correct werkt, werkt de redirect automatisch mee

### Technisch
- 2 bestanden: `CartDrawer.tsx`, `hooks.ts`

