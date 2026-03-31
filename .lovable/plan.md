

## Fix: Bundel korting verdwijnt bij aanpassing + verkeerd percentage

### Analyse

Uit de screenshots:
- **Screenshot 1**: qty=1 battery → Individual total €994.95, Bundle price €820.00, Save €174.95 (-18%). Maar korting is 12%.
- **Screenshot 2**: qty=2 battery → Bundle price €1265.00, korting/savings **verdwijnen** volledig.

### Oorzaak

De code berekent voor dynamic bundles:
- `individualTotal` = **statisch** `product.bundle_individual_total` (€994.95, van API, inclusief out-of-stock items op default qty)
- `dynamicTotal` = som van **huidige** quantities × prijzen (alleen in-stock)
- `saving` = `individualTotal - dynamicTotal`

Zodra je de battery-qty verhoogt naar 2, wordt `dynamicTotal` (€1265) **hoger** dan het statische `individualTotal` (€994.95), waardoor `saving` negatief wordt en de badge verdwijnt.

De 12% korting wordt nergens toegepast — de code sommeert gewoon de volle stukprijzen.

### Oplossing

**Bestand: `src/components/BundleContents.tsx`**

1. **Bereken de kortingspercentage** uit de API-data:
```tsx
const discountRate = (product.bundle_individual_total && product.bundle_savings)
  ? product.bundle_savings / product.bundle_individual_total
  : 0;
```

2. **`individualTotal` wordt dynamisch** (schaalt mee met gekozen quantities):
```tsx
const individualTotal = useMemo(() =>
  (items ?? []).reduce((sum, item, idx) =>
    item.product.in_stock === false ? sum : sum + item.product.price * (quantities[idx] ?? item.quantity),
    0
  ), [items, quantities]
);
```

3. **`bundlePrice` past de korting toe**:
```tsx
const bundlePrice = isDynamic
  ? dynamicTotal * (1 - discountRate)  // dynamicTotal = individualTotal, so: price = total × 0.88
  : product.price;
```

Eigenlijk is `dynamicTotal` dezelfde som als de nieuwe dynamische `individualTotal`. We kunnen ze samenvoegen:
```tsx
const fullTotal = useMemo(() => /* som van qty × price, in-stock only */);
const bundlePrice = isDynamic ? fullTotal * (1 - discountRate) : product.price;
const saving = isDynamic ? fullTotal * discountRate : (product.bundle_savings ?? 0);
```

4. **Savings% is nu altijd 12%** (of wat de API ook instelt), ongeacht qty-wijzigingen.

5. **`individualTotal` weergave in footer**: toon `fullTotal` doorgestreept, en daaronder `bundlePrice` (= fullTotal × 0.88).

### Resultaat
- Korting blijft altijd 12% ongeacht quantity-aanpassingen
- Savings badge schaalt mee proportioneel
- Geen verdwijning meer bij qty-wijziging

