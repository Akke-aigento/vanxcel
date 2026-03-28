

## Bundel Product Weergave — Update conform nieuwe API

### Probleem
De huidige code werkt al deels, maar matcht niet volledig met de nieuwe API response:
1. **`BundleItem` type**: `product.images: string[] | null` maar API stuurt `product.image: string`
2. **`BundleContents.tsx`**: leest `item.product.images?.[0]` i.p.v. `item.product.image`
3. **Nieuwe velden ontbreken**: `bundle_savings`, `bundle_pricing_model`, `bundle_discount_type`, `bundle_discount_value`, `customer_can_adjust`, `min_quantity`, `max_quantity`, `sort_order`, `in_stock`
4. **ProductCard**: toont geen "Bundel" badge bij `product_type === 'bundle'`
5. **`product_type`** is niet getypt als union — is gewoon `string?`

### Wijzigingen

| Bestand | Wijziging |
|---|---|
| `src/integrations/sellqo/types.ts` | `BundleItem.product.image: string \| null` (was `images`); nieuwe velden: `customer_can_adjust`, `min_quantity`, `max_quantity`, `sort_order`, `product.in_stock`; `Product.bundle_savings?: number`; `product_type` als union type |
| `src/integrations/sellqo/normalizer.ts` | Normaliseer `bundle_items[].product.image` (string → bewaar als string); map `bundle_savings` |
| `src/components/BundleContents.tsx` | Gebruik `item.product.image` i.p.v. `item.product.images?.[0]`; toon `bundle_savings` direct uit API; toon `in_stock` status per item |
| `src/components/ProductCard.tsx` | Voeg "Bundel" badge toe wanneer `product.product_type === 'bundle'` |
| `src/i18n/locales/{nl,en,de,fr}.json` | Key `product.bundle` ("Bundel" / "Bundle" / "Bündel" / "Lot") |

### Details

**Types update** — `BundleItem`:
```typescript
export interface BundleItem {
  id?: string;
  product_id: string;
  quantity: number;
  is_required?: boolean;
  customer_can_adjust?: boolean;
  min_quantity?: number;
  max_quantity?: number | null;
  sort_order?: number;
  product: { id: string; name: string; price: number; image: string | null; slug: string; in_stock?: boolean };
}
```

**ProductCard** — badge positie linksboven (waar ook "low stock" badge zit), gestapeld:
```tsx
{product.product_type === 'bundle' && (
  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
    {t("product.bundle")}
  </div>
)}
```

**BundleContents** — minimale fix: `item.product.image` direct als `src`, plus out-of-stock styling per item als `in_stock === false`.

