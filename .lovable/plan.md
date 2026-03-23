

## Fix: sellqo-proxy naar correct SellQo project

### Probleem

De proxy stuurt requests naar `${SUPABASE_URL}/functions/v1/storefront-api` — dat is het **eigen** VanXcel Supabase project. Maar de storefront-api draait op een **ander** project: `gczmfcabnoofnmfpzeop.supabase.co`.

Daarnaast gebruikt de API een `X-API-Key` header voor authenticatie, niet de Supabase service role key.

### Wat er moet veranderen

**1. `supabase/functions/sellqo-proxy/index.ts`** — Update de proxy:
- Hardcode de base URL naar `https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api`
- Lees `SELLQO_API_KEY` uit environment secrets (de `sk_live_b569...` key)
- Stuur `X-API-Key: ${SELLQO_API_KEY}` header mee in plaats van `Authorization: Bearer ${SERVICE_ROLE_KEY}`
- Tenant ID als query param blijft hetzelfde (`tenant_id=vanxcel`)

**2. Secret toevoegen** — `SELLQO_API_KEY` met de waarde van de Storefront API Key uit je SellQo dashboard (de `sk_live_b569...` key)

### Technische details

De proxy flow wordt:
```text
Frontend → sellqo-proxy (VanXcel Supabase)
  → https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api/products?tenant_id=vanxcel
     Headers: X-API-Key: sk_live_b569...
```

