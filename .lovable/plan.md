

## Fix: 12% bundelkorting — API stuurt geen discount-velden

### Root cause (bevestigd via API call)

De raw API response bevat:
```
bundle_discount_type: niet aanwezig
bundle_discount_value: niet aanwezig  
bundle_savings: 994.95
bundle_individual_total: 994.95
price: 0
bundle_pricing_model: "dynamic"
```

- `bundle_savings` = `bundle_individual_total` → dat is een API-bug (savings kan niet 100% zijn)
- Er zijn geen expliciete discount-velden
- De korting van 12% staat enkel in de productnaam: *"12% Discount Bundle"*

### Oplossing: Extract discount uit productnaam als fallback

Aangezien de API geen discount-velden meestuurt, parseren we het percentage uit de producttitel als tijdelijke workaround.

**Bestand: `src/components/BundleContents.tsx`**

De `discountRate` berekening aanpassen met een extra fallback die een percentage-patroon uit de titel haalt:

```text
Prioriteit:
1. bundle_discount_type === 'percentage' → bundle_discount_value / 100
2. bundle_discount_type === 'fixed' → bundle_discount_value / fullTotal
3. !isDynamic → bundle_savings / bundle_individual_total (alleen fixed bundles)
4. NIEUW: regex match op product.title voor patroon "XX% Discount" → XX / 100
5. Fallback: 0
```

Concrete code:
```tsx
const discountRate = useMemo(() => {
  if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    return product.bundle_discount_value / 100;
  }
  if (product.bundle_discount_type === 'fixed' && product.bundle_discount_value && fullTotal > 0) {
    return product.bundle_discount_value / fullTotal;
  }
  if (!isDynamic && product.bundle_individual_total && product.bundle_savings 
      && product.bundle_individual_total > 0) {
    return product.bundle_savings / product.bundle_individual_total;
  }
  // Fallback: parse discount percentage from product title
  const match = product.title?.match(/(\d+)%\s*(discount|korting|rabatt|remise)/i);
  if (match) {
    return parseInt(match[1], 10) / 100;
  }
  return 0;
}, [product, fullTotal, isDynamic]);
```

### Overweging

Dit is een **workaround** totdat de SellQo API `bundle_discount_type` en `bundle_discount_value` correct meestuurt. De regex-aanpak werkt voor producten met "12% Discount" of "12% Korting" in de titel — wat nu het geval is bij alle drie de bundels.

### Technische details

- **1 bestand** aan te passen: `src/components/BundleContents.tsx`
- Regex pattern: `/(\d+)%\s*(discount|korting|rabatt|remise)/i` — werkt voor NL, EN, DE, FR
- Geen andere bestanden hoeven te wijzigen
- De rest van de berekening (bundlePrice, saving, savingPct) blijft ongewijzigd

