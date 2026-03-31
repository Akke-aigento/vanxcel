

## Fix: Bundelprijzen op shop overzicht — simpele directe aanpak

### Probleem

De huidige code heeft te veel condities en fallbacks die elkaar tegenwerken. Het probleem zit in de detectie (`isDynamicBundle`) en de berekening (`bundleCalc`) die afhankelijk zijn van velden die de list API mogelijk niet meestuurt.

### Oplossing — radicaal vereenvoudigen

**Bestand: `src/components/ProductCard.tsx`**

Vervang de hele `isDynamicBundle` + `bundleCalc` logica (regels 21-51) door een simpele directe berekening:

```tsx
const isBundle = product.product_type === 'bundle';

// Bundle pricing — gebruik direct de beschikbare velden
const originalPrice = isBundle ? Number(product.bundle_individual_total ?? 0) : 0;
const bundleSavings = isBundle ? Number(product.bundle_savings ?? 0) : 0;

// Parse korting uit titel als fallback (bv. "12% Discount")
let bundleDiscountRate = 0;
if (isBundle && product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
  bundleDiscountRate = product.bundle_discount_value / 100;
} else if (isBundle) {
  const match = product.title?.match(/(\d+)%\s*(discount|korting|rabatt|remise)/i);
  if (match) bundleDiscountRate = parseInt(match[1], 10) / 100;
}

// Bereken bundelprijs
const bundlePrice = isBundle && originalPrice > 0
  ? (bundleDiscountRate > 0 ? originalPrice * (1 - bundleDiscountRate) : Math.max(0, originalPrice - bundleSavings))
  : 0;
const showBundlePricing = isBundle && bundlePrice > 0;
```

Prijsweergave (regels 144-166) wordt:
```tsx
{showBundlePricing ? (
  <>
    <span className="text-xs text-muted-foreground">{t('product.startingFrom')}</span>
    <span className="text-lg font-bold text-primary">€{bundlePrice.toFixed(2)}</span>
    {bundlePrice < originalPrice && (
      <span className="text-sm text-muted-foreground line-through">€{originalPrice.toFixed(2)}</span>
    )}
  </>
) : isBundle ? (
  <span className="text-sm font-medium text-primary">{t('product.viewBundle')}</span>
) : (
  // bestaande niet-bundel prijs
)}
```

Discount badge (regels 115-123): gebruik `bundleDiscountRate` i.p.v. `bundleCalc?.discountRate`.

### Waarom dit werkt
- Geen afhankelijkheid meer van `bundle_pricing_model` (die de list API niet stuurt)
- Geen afhankelijkheid meer van `bundle_items` (die de list API niet stuurt)
- Gebruikt direct `bundle_individual_total` en `bundle_savings` — die de normalizer WEL meeneemt
- Titel-regex als fallback voor het kortingspercentage

### Technisch
- 1 bestand: `src/components/ProductCard.tsx`

