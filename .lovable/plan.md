

## Fix: Bundel producten tonen €0.00 op shop overzicht

### Root cause

De list API (`/products`) retourneert bij bundles:
- `product_type: "bundle"`
- `price: 0`
- `tags: ["bundle", "bundle-no-price"]`
- **Geen** `bundle_pricing_model`, `bundle_individual_total`, `bundle_discount_type`, of `bundle_discount_value`

Dus `isDynamicBundle` is altijd `false` op de overzichtspagina, en de code valt terug op `product.price` = €0.00.

### Oplossing

**Bestand: `src/components/ProductCard.tsx`**

Verbreed de detectie: een bundle met `price === 0` en geen `bundle_pricing_model` is ook een dynamic bundle. Parse de korting uit de titel:

```tsx
const isBundle = product.product_type === 'bundle';
const isDynamicBundle = isBundle && (product.bundle_pricing_model === 'dynamic' || product.price === 0);
```

En in `bundleCalc`, als er geen `bundle_items` EN geen `bundle_individual_total` is, return `null` — zodat we in de prijsweergave een fallback tonen.

**Prijsweergave aanpassen:**
- Als `isDynamicBundle` en `bundleCalc` is `null` (geen data beschikbaar in list API): toon **geen prijs** of toon alleen de bundel-badge. De prijs wordt pas zichtbaar als de gebruiker doorklikt naar de detailpagina.
- Concreet: vervang `€0.00` door een tekst zoals "Bekijk bundel" of verberg de prijs:

```tsx
{isDynamicBundle && bundleCalc ? (
  <>
    <span className="text-xs text-muted-foreground">{t('product.startingFrom')}</span>
    <span className="text-lg font-bold text-primary">€{bundleCalc.bundlePrice.toFixed(2)}</span>
    {bundleCalc.discountRate > 0 && (
      <span className="text-sm text-muted-foreground line-through">€{bundleCalc.individualTotal.toFixed(2)}</span>
    )}
  </>
) : isDynamicBundle ? (
  <span className="text-sm font-medium text-primary">{t('product.viewBundle')}</span>
) : (
  // bestaande prijs rendering
)}
```

**i18n keys toevoegen:**
- NL: `"product.viewBundle": "Bekijk bundel"`
- EN: `"product.viewBundle": "View bundle"`
- DE: `"product.viewBundle": "Bundle ansehen"`
- FR: `"product.viewBundle": "Voir le bundle"`

### Resultaat
- Bundels tonen niet langer €0.00 op de overzichtspagina
- Als de list API geen prijsdata meestuurt, wordt "Bekijk bundel" getoond i.p.v. een misleidende prijs
- Als er wél `bundle_individual_total` beschikbaar is, wordt de "Vanaf" prijs met korting getoond

### Technisch
- 1 bestand: `src/components/ProductCard.tsx`
- 4 i18n bestanden: `en.json`, `nl.json`, `de.json`, `fr.json`

