

## Bundle prijsweergave op ProductCard (shop overzicht)

### Probleem
Dynamic bundles hebben `product.price = 0`, waardoor de ProductCard €0.00 toont. De "vanaf"-prijs met korting moet hier ook zichtbaar zijn, net als op de productdetailpagina.

### Oplossing

**Bestand: `src/components/ProductCard.tsx`**

1. Bereken voor bundles met `bundle_pricing_model === 'dynamic'` een startprijs op basis van `bundle_items`:
   - `individualTotal` = som van `item.product.price × min_quantity` (alleen in-stock items)
   - Parse kortingspercentage uit titel als fallback (zelfde regex als BundleContents)
   - `bundleStartPrice` = `individualTotal × (1 - discountRate)`

2. Pas de prijsweergave aan:
   - Voor dynamic bundles: toon "Vanaf €XXX" als actieve prijs + doorgestreepte `individualTotal`
   - De discount badge rechtsboven toont het kortingspercentage

**Concrete wijziging in de prijssectie (regel 107-116):**

```tsx
// Bovenaan component, na bestaande variabelen:
const isBundle = product.product_type === 'bundle';
const isDynamicBundle = isBundle && product.bundle_pricing_model === 'dynamic' && product.bundle_items?.length;

const bundleCalc = isDynamicBundle ? (() => {
  const items = product.bundle_items!;
  const individualTotal = items.reduce((sum, item) => {
    if (item.product?.in_stock === false) return sum;
    const qty = item.min_quantity ?? item.quantity;
    return sum + (item.product?.price || 0) * qty;
  }, 0);
  
  let discountRate = 0;
  if (product.bundle_discount_type === 'percentage' && product.bundle_discount_value) {
    discountRate = product.bundle_discount_value / 100;
  } else {
    const match = product.title?.match(/(\d+)%\s*(discount|korting|rabatt|remise)/i);
    if (match) discountRate = parseInt(match[1], 10) / 100;
  }
  
  return { individualTotal, bundlePrice: individualTotal * (1 - discountRate), discountRate };
})() : null;

// In de prijsweergave:
{isDynamicBundle && bundleCalc ? (
  <>
    <span className="text-xs text-muted-foreground">{t('product.startingFrom')}</span>
    <span className="text-lg font-bold text-primary">€{bundleCalc.bundlePrice.toFixed(2)}</span>
    {bundleCalc.discountRate > 0 && (
      <span className="text-sm text-muted-foreground line-through">€{bundleCalc.individualTotal.toFixed(2)}</span>
    )}
  </>
) : (
  // bestaande prijs-rendering
)}
```

3. Discount badge (regel 82-86): ook tonen voor dynamic bundles met geparsed percentage uit titel.

**Geen andere bestanden** hoeven te wijzigen. De `product.startingFrom` i18n-key bestaat al.

