

## Fix: Bestsellers laadt alle producten i.p.v. gefilterd

### Oorzaak
De frontend stuurt `?collection=bestsellers` als query parameter. De proxy stuurt dit door als `params.collection` naar de SellQo `get_products` action. Maar SellQo verwacht waarschijnlijk `category` of `category_slug` als parameternaam — niet `collection`. Hierdoor wordt het filter genegeerd en komen alle producten terug.

### Oplossing
In de `sellqo-proxy` de `collection` parameter mappen naar `category_slug` (of `category`) voordat het naar de SellQo API gaat.

| Bestand | Wijziging |
|---|---|
| `supabase/functions/sellqo-proxy/index.ts` | In de products-route: als `params.collection` bestaat, hernoem naar `category_slug` (en verwijder `collection`) |

### Technisch detail
In `resolveAction`, na regel 32 waar alle query params worden overgenomen:

```typescript
// Map 'collection' to 'category_slug' for SellQo API compatibility
if (params.collection) {
  params.category_slug = params.collection;
  delete params.collection;
}
```

Dit is een éénregelige fix in de proxy. De frontend (`api.ts`, `hooks.ts`, `FeaturedProducts.tsx`) hoeft niet te veranderen — het probleem zit puur in de param-naam vertaling.

**Opmerking**: Als `category_slug` niet het juiste veld blijkt, kan het ook `category` zijn. We kunnen dit testen na deploy.

