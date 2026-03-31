

## Fix: Bundel prijsberekening en weergave

### Problemen (uit screenshot)
1. **Per-item prijs lijkt doorgestreept** — de stukprijs staat er wel, maar er mist een subtotaal per item
2. **Bundelprijs = €0.00** — omdat dynamic total berekend wordt met out-of-stock items op qty=0
3. **Besparing = €994.95 / -100%** — klopt niet, want individualTotal telt out-of-stock items mee maar dynamicTotal niet
4. **Aantallen niet aanpasbaar** — waarschijnlijk `customer_can_adjust` niet true in API, of out-of-stock items blokkeren het
5. **Out-of-stock items tellen mee in individualTotal** — die moeten uitgesloten worden

### Oplossing

**Bestand: `src/components/BundleContents.tsx`**

| Fix | Detail |
|---|---|
| Out-of-stock uitsluiten uit totalen | Items waar `in_stock === false` worden niet meegeteld in `individualTotal` én `dynamicTotal` |
| Out-of-stock qty forceren op 0 | Bij initialisatie: als `in_stock === false`, qty = 0 ongeacht min_quantity |
| Out-of-stock +/- blokkeren | Disable beide knoppen als item out-of-stock |
| Per-item subtotaal verbeteren | Toon subtotaal alleen als qty > 0; toon "—" als qty = 0 |
| Prijs per stuk niet doorgestreept | Controleer dat er geen `line-through` styling op de stukprijs zit (is er niet in code, maar verduidelijk visueel) |

### Kernlogica wijzigingen

```tsx
// Initialisatie: out-of-stock items op 0
const [quantities, setQuantities] = useState<number[]>(
  () => items?.map((i) => 
    i.product.in_stock === false ? 0 : (i.min_quantity ?? i.quantity)
  ) ?? []
);

// individualTotal: alleen in-stock items meetellen
const individualTotal = product.bundle_individual_total ??
  (items ?? []).reduce((s, i) => 
    i.product.in_stock === false ? s : s + i.product.price * i.quantity, 0
  );

// dynamicTotal: alleen in-stock items
const dynamicTotal = useMemo(() =>
  (items ?? []).reduce((sum, item, idx) => 
    item.product.in_stock === false ? sum : sum + (item.product?.price || 0) * (quantities[idx] ?? item.quantity),
    0
  ), [items, quantities]
);

// updateQty: blokkeer out-of-stock
const updateQty = (index: number, delta: number) => {
  const item = items[index];
  if (item.product.in_stock === false) return;
  // ... rest unchanged
};
```

Per item in de render:
```tsx
// Disable +/- for out-of-stock
{canAdjust && !outOfStock ? (
  <div className="flex items-center border ...">
    <button disabled={qty <= min} ...><Minus /></button>
    <span>{qty}</span>
    <button disabled={max != null && qty >= max} ...><Plus /></button>
  </div>
) : outOfStock ? (
  <span className="text-xs text-destructive">×0</span>
) : (
  <span>×{qty}</span>
)}
```

**Bestand: `src/pages/ProductDetail.tsx`** — bundleStartingPrice berekening ook out-of-stock uitsluiten:
```tsx
const bundleStartingPrice = (isBundle && product.bundle_pricing_model === 'dynamic' && product.bundle_items)
  ? product.bundle_items.reduce((sum, item) => {
      if (item.product?.in_stock === false) return sum;
      const minQty = item.min_quantity ?? item.quantity;
      return sum + (item.product?.price || 0) * minQty;
    }, 0)
  : null;
```

**i18n**: geen nieuwe keys nodig.

