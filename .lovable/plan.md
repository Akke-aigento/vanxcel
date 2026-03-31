

## Fix: Bundelkorting blijft 100% — root cause & oplossing

### Root cause

De `discountRate` berekening op regel 40-51 heeft drie stappen:
1. Check `bundle_discount_type === 'percentage'` → werkt als de API dit meestuurt
2. Check `bundle_discount_type === 'fixed'` → idem
3. **Fallback**: `bundle_savings / bundle_individual_total`

Voor dynamic bundles stuurt de API `price = 0`, dus `bundle_savings = bundle_individual_total` (bv. €820 / €820 = **100%**). De eerste twee checks falen waarschijnlijk omdat de API `bundle_discount_type` niet meestuurt (of het wordt als lege string/"null" genormaliseerd).

**Bewijs**: screenshot toont Bundle price = €0.00, Save €820.00 (-100%). Dit bevestigt dat `discountRate = 1.0`.

### Oplossing

**Bestand: `src/components/BundleContents.tsx`**

Twee aanpassingen:

1. **Debug log toevoegen** (tijdelijk) om te zien wat de API daadwerkelijk stuurt:
```tsx
console.log('[Bundle debug]', {
  bundle_discount_type: product.bundle_discount_type,
  bundle_discount_value: product.bundle_discount_value,
  bundle_savings: product.bundle_savings,
  bundle_individual_total: product.bundle_individual_total,
  price: product.price,
});
```

2. **Fallback veilig maken** — voor dynamic bundles mag de fallback NIET `savings/total` gebruiken als dat 100% oplevert:

```tsx
const discountRate = useMemo(() => {
  // Primary: explicit discount fields from API
  if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    return product.bundle_discount_value / 100;
  }
  if (product.bundle_discount_type === 'fixed' && product.bundle_discount_value && fullTotal > 0) {
    return product.bundle_discount_value / fullTotal;
  }
  // Fallback: only for FIXED pricing model (not dynamic)
  if (!isDynamic && product.bundle_individual_total && product.bundle_savings && product.bundle_individual_total > 0) {
    return product.bundle_savings / product.bundle_individual_total;
  }
  return 0;
}, [product, fullTotal, isDynamic]);
```

Dit zorgt dat:
- **Fixed bundles**: fallback werkt nog (savings zijn daar correct)
- **Dynamic bundles zonder discount fields**: korting = 0% (geen fictieve 100%)
- **Dynamic bundles mét discount fields**: percentage/fixed korting wordt correct toegepast

3. **Bundle price voor dynamic zonder korting**: `bundlePrice = fullTotal` (= de som van items zonder korting). Dit is logisch — als er geen korting is ingesteld, betaal je de volle prijs.

### Resultaat na fix
- Badge toont het juiste percentage (12% als API het meestuurt, 0% als niet)
- Bundleprijs = `fullTotal × (1 - discountRate)` i.p.v. €0.00
- De console log helpt ons zien wat de API exact stuurt, zodat we daarna eventueel de normalizer/proxy kunnen aanpassen

