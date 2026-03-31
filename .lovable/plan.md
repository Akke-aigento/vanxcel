

## Fix: Dynamic bundles tonen €0.00 op ProductCard

### Oorzaak
`isDynamicBundle` vereist `product.bundle_items?.length > 0`, maar de **product list API** stuurt geen `bundle_items` mee — alleen de detail API doet dat. Dus valt de card terug op `product.price` = `€0.00`.

### Oplossing

**Bestand: `src/components/ProductCard.tsx`**

Verbreed de detectie en voeg een fallback toe voor wanneer `bundle_items` ontbreekt:

1. **Nieuwe `isDynamicBundle` check** — ook `true` als `bundle_pricing_model === 'dynamic'` zonder items:
```tsx
const isDynamicBundle = isBundle && product.bundle_pricing_model === 'dynamic';
```

2. **`bundleCalc` aanpassen** — als `bundle_items` beschikbaar zijn, bereken zoals nu. Als niet, gebruik `bundle_individual_total` van de API:
```tsx
const bundleCalc = isDynamicBundle ? (() => {
  let individualTotal = 0;
  const items = product.bundle_items;
  
  if (items && items.length > 0) {
    individualTotal = items.reduce((sum, item) => {
      if (item.product?.in_stock === false) return sum;
      const qty = item.min_quantity ?? item.quantity;
      return sum + (item.product?.price || 0) * qty;
    }, 0);
  } else if (product.bundle_individual_total) {
    individualTotal = product.bundle_individual_total;
  }
  
  let discountRate = 0;
  if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    discountRate = product.bundle_discount_value / 100;
  } else {
    const match = product.title?.match(/(\d+)%\s*(discount|korting|rabatt|remise)/i);
    if (match) discountRate = parseInt(match[1], 10) / 100;
  }
  
  const bundlePrice = individualTotal * (1 - discountRate);
  
  // Als individualTotal ook 0 is (geen data), return null
  if (individualTotal === 0) return null;
  
  return { individualTotal, bundlePrice, discountRate };
})() : null;
```

3. **Prijsweergave** — als `isDynamicBundle` maar `bundleCalc` is null (geen data), toon dan gewoon de bundel badge zonder prijs, of `product.price` als die > 0 is.

### Resultaat
- Dynamic bundles met `bundle_items` → "Vanaf €XXX" + doorgestreept (huidige logica)
- Dynamic bundles zonder `bundle_items` maar mét `bundle_individual_total` → prijs berekend uit dat veld + titel-regex korting
- Geen €0.00 meer zichtbaar

### Technisch
- 1 bestand: `src/components/ProductCard.tsx`
- Geen API/proxy wijzigingen nodig

