

## Fix: Bundelkorting toont 100% i.p.v. 12%

### Oorzaak

De huidige code berekent `discountRate` als `bundle_savings / bundle_individual_total`. Voor dynamic bundles is `product.price = 0`, dus de API stuurt `bundle_savings = bundle_individual_total`, wat resulteert in `discountRate = 1.0 = 100%`.

De **werkelijke** kortingsinstellingen zitten in twee velden die al genormaliseerd worden maar niet gebruikt:
- `product.bundle_discount_type` (bv. `"percentage"`)
- `product.bundle_discount_value` (bv. `12`)

### Oplossing

**Bestand: `src/components/BundleContents.tsx`** — regel 28-31

Gebruik `bundle_discount_type` + `bundle_discount_value` als primaire bron:

```tsx
// Determine discount rate from explicit API fields
const discountRate = useMemo(() => {
  if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    return product.bundle_discount_value / 100; // e.g. 12 → 0.12
  }
  if (product.bundle_discount_type === 'fixed' && product.bundle_discount_value && fullTotal > 0) {
    return product.bundle_discount_value / fullTotal; // fixed amount as ratio
  }
  // Fallback: derive from API totals (only valid for fixed bundles)
  if (product.bundle_individual_total && product.bundle_savings && product.bundle_individual_total > 0) {
    return product.bundle_savings / product.bundle_individual_total;
  }
  return 0;
}, [product, fullTotal]);
```

Voor **fixed discount type**, pas de saving berekening aan:
```tsx
const saving = isDynamic
  ? (product.bundle_discount_type === 'fixed' ? product.bundle_discount_value! : fullTotal * discountRate)
  : (product.bundle_savings ?? 0);
```

Geen andere bestanden hoeven te wijzigen — de velden zijn al beschikbaar in het `Product` type en de normalizer.

### Resultaat
- **Percentage korting** (bv. 12%): badge toont `-12%`, bundleprijs = fullTotal × 0.88
- **Vaste korting** (bv. €50): badge toont juist percentage, bundleprijs = fullTotal - €50
- Korting verdwijnt niet meer bij quantity-aanpassingen

