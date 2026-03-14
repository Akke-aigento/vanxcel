

## Update sellqo-proxy Edge Function

The current proxy forwards to an external `SELLQO_API_URL` with `SELLQO_API_KEY`. Per the new requirement, it should instead forward to the **storefront-api** edge function running on the same Supabase project.

### Changes to `supabase/functions/sellqo-proxy/index.ts`

**Replace the current implementation with:**
- Base URL: `${SUPABASE_URL}/functions/v1/storefront-api` (using `Deno.env.get('SUPABASE_URL')`)
- Auth header: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` (using `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`)
- Read `X-Tenant-ID` from incoming request header (default to `vanxcel`)
- Pass `tenant_id` as a **query parameter** instead of a header (per the example: `?tenant_id=vanxcel`)
- Forward method, body, and merge query params
- CORS headers remain the same
- Return storefront-api response unchanged

### No changes needed to:
- `supabase/config.toml` — already correct
- `src/integrations/sellqo/client.ts` — still sends `X-Tenant-ID` header which the proxy reads

