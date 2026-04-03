

## Fix: Laatste bugs ronde 3

### Bug 1: "Bankoverschrijving" hernoemd naar "QR code met je bankapp"

**Probleem**: De betaalmethode `bank_transfer` toont de API-naam "Bankoverschrijving". Zowel `bank_transfer` als `qr_transfer` moeten hetzelfde label krijgen.

**Fix in `src/pages/Checkout.tsx`** (StepPayment):
- In de `visibleMethods` rendering: ook `bank_transfer` dezelfde label geven als `qr_transfer`
- Regel 230: voeg `bank_transfer` toe aan de naam-override: `method.id === 'qr_transfer' || method.id === 'bank_transfer'` → toon `t("checkout.qrName")` ("QR code met je bankapp")
- Idem voor beschrijving (regel 233) en badge (regel 237)

### Bug 2: Winkelmandje badge wordt niet leeggemaakt

**Probleem**: `clearCart()` in `CartContext.tsx` (regel 79) roept alleen `clearStoredCartId()` aan. Dit verwijdert de localStorage key, maar de react-query cache behoudt de cart data. Omdat `useCartQuery` de `cartId` leest bij mount (niet reactief), blijft `cart` gevuld en toont de badge het oude aantal.

**Fix in `src/integrations/sellqo/CartContext.tsx`**:
- Import `useQueryClient` van `@tanstack/react-query`
- In `CartProvider`: `const queryClient = useQueryClient()`
- `clearCart` aanpassen:
  ```
  const clearCart = useCallback(() => {
    const oldCartId = getStoredCartId();
    clearStoredCartId();
    if (oldCartId) {
      queryClient.setQueryData(sellqoKeys.cart(oldCartId), undefined);
      queryClient.removeQueries({ queryKey: sellqoKeys.cart(oldCartId) });
    }
  }, [queryClient]);
  ```
- Dit zorgt ervoor dat `cart` undefined wordt → `itemCount` wordt 0 → badge verdwijnt

**Vereist ook**: import `sellqoKeys` uit `./hooks` (of herdefinieer de key).

### Bug 3: QR code wordt niet getoond op bedankt-pagina

**Probleem**: De ThankYou pagina code ziet er correct uit (regels 156-172). Het probleem zit waarschijnlijk in de `clearCart` die een re-render triggert waardoor `routeState` verloren gaat, OF de `qr_data` komt niet mee van de API.

**Fix in `src/pages/ThankYou.tsx`**:
- Sla `routeState` op in een `useRef` bij eerste render zodat re-renders door `clearCart` het niet verliezen
- Voeg een `console.log` toe voor debugging van de QR data flow (tijdelijk)

**Fix in `src/integrations/sellqo/CheckoutContext.tsx`** (regels 253-262):
- Zorg dat `qr_data` correct wordt doorgegeven. Controleer of de API response key `qr_data` of `qrData` is — normaliseer naar `qr_data` in de navigate state

### Bestanden (3)
- `src/integrations/sellqo/CartContext.tsx` — clearCart invalidate react-query cache
- `src/pages/Checkout.tsx` — bank_transfer label hernoemd
- `src/pages/ThankYou.tsx` — routeState ref + QR robuustheid

