

## Bundelprijs tonen i.p.v. "Bekijk bundel" op shop overzicht

### Probleem
Dynamic bundles op de shop-overzichtspagina tonen "Bekijk bundel" omdat `bundleCalc` `null` retourneert. Vermoedelijk stuurt de list API wél `bundle_individual_total` mee (994.95 zichtbaar in console), maar er zit mogelijk een bug in de data flow.

### Aanpak

**Bestand: `src/components/ProductCard.tsx`**

1. **Debug toevoegen** (tijdelijk) om te bevestigen welke bundle-velden de list API meestuurt:
```tsx
if (isBundle) console.log('[ProductCard bundle]', product.slug, {
  price: product.price,
  bundle_individual_total: product.bundle_individual_total,
  bundle_pricing_model: product.bundle_pricing_model,
  bundle_items: product.bundle_items?.length,
});
```

2. **Fallback versterken** in `bundleCalc`: als `bundle_individual_total` ontbreekt maar `bundle_savings` aanwezig is en > 0, gebruik `bundle_savings` als benadering van de individuele totaal (het is gelijk voor deze producten, want `price=0`).

3. **Prijsweergave aanpassen** — vervang de "Bekijk bundel" fallback (regel 150-151) door:
   - Als `isDynamicBundle` en `bundleCalc` beschikbaar: toon "Vanaf €XXX" + doorgestreept origineel (bestaande logica, werkt al)
   - Als `isDynamicBundle` en `bundleCalc` is null: toon "Bekijk bundel" (ongewijzigd als absolute fallback)
   
   De kern van de fix is ervoor zorgen dat `bundleCalc` NIET null is wanneer de data er wel is.

4. **Na debug-verificatie**: console.log weer verwijderen.

### Verwacht resultaat
- Bundels tonen "Vanaf €875.56" met doorgestreept "€994.95" en een `-12%` badge
- Alleen als echt geen data beschikbaar is, valt het terug op "Bekijk bundel"

### Technisch
- 1 bestand: `src/components/ProductCard.tsx`

