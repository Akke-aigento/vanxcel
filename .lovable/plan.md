

## Dynamische bundelprijs als "Vanaf" prijs

### Probleem
Bij bundels met `bundle_pricing_model: "dynamic"` toont de productpagina `€0.00` als prijs (regel 134), omdat `product.price` niet gevuld is voor dynamic bundles. De gebruiker wil een "Vanaf €X" prijs zien, berekend op basis van de **minimale aantallen** per item.

### Oplossing

**2 bestanden aanpassen:**

| Bestand | Wijziging |
|---|---|
| `src/pages/ProductDetail.tsx` | Voor dynamic bundles: bereken "starting from" prijs (som van `min_quantity × item.price`) en toon als "Vanaf €X" i.p.v. de standaard prijs |
| `src/components/BundleContents.tsx` | Initialiseer quantities op `min_quantity` i.p.v. `item.quantity`, zodat de BundleContents footer-prijs overeenkomt met de "Vanaf" prijs |
| `src/i18n/locales/*.json` | Voeg `"product.startingFrom"` key toe (NL/EN/DE/FR) |

### Technisch detail

**ProductDetail.tsx** — rond regel 72-74, na `variantPrice`:
```tsx
// For dynamic bundles, calculate "starting from" price using min quantities
const bundleStartingPrice = (product.product_type === 'bundle' && product.bundle_pricing_model === 'dynamic' && product.bundle_items)
  ? product.bundle_items.reduce((sum, item) => {
      const minQty = item.min_quantity ?? item.quantity;
      return sum + (item.product?.price || 0) * minQty;
    }, 0)
  : null;
```

Regel 134 — prijsweergave:
```tsx
{bundleStartingPrice != null ? (
  <span className="text-2xl font-bold text-primary">
    {t("product.startingFrom")} €{bundleStartingPrice.toFixed(2)}
  </span>
) : (
  <span className="text-2xl font-bold text-primary">€{variantPrice.toFixed(2)}</span>
)}
```

En verberg de losse quantity-selector + add-to-cart button voor bundels (die zitten al in BundleContents).

**BundleContents.tsx** — regel 20-21, initialiseer op min_quantity:
```tsx
const [quantities, setQuantities] = useState<number[]>(
  () => items?.map((i) => i.min_quantity ?? i.quantity) ?? []
);
```

**i18n keys:**
- NL: `"Vanaf"` / EN: `"Starting from"` / DE: `"Ab"` / FR: `"À partir de"`

