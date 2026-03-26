
## Fixplan: registratie blijft falen op publieke website

### Diagnose (na check in huidige project + Sellqo project)
- `register` via `sellqo-customer-proxy` met `tenant_id: "vanxcel"` geeft `500` met `"[object Object]"`.
- Dezelfde call met tenant UUID `54f6b480-280b-42e1-b843-d5beb2831acd` werkt wél (customer + token terug).
- In Sellqo storefront-auth wordt ook met `tenant.id` (UUID) gewerkt, niet met slug.
- Conclusie: customer-auth flow moet UUID gebruiken; slug `"vanxcel"` breekt vooral op register/write pad.

## Implementatie
1. **Tenant-ID’s scheiden per API-flow**
   - In de SellQo integratie één centrale config gebruiken:
     - `STOREFRONT_TENANT_SLUG = "vanxcel"` (voor `sellqo-proxy`, products/settings)
     - `CUSTOMER_TENANT_ID = "54f6b480-280b-42e1-b843-d5beb2831acd"` (voor `sellqo-customer-proxy`, auth/account)
   - Bestanden:
     - `src/integrations/sellqo/customerClient.ts`
     - (optioneel centraliseren in nieuw constants-bestand, daarna importeren in `client.ts` + `customerClient.ts`)

2. **Customer API body corrigeren**
   - In `customerApiFetch` body wijzigen van:
     - `tenant_id: 'vanxcel'`
     - naar `tenant_id: CUSTOMER_TENANT_ID`

3. **Error handling verbeteren (geen `[object Object]` meer)**
   - `customerApiFetch` robuuster maken:
     - response veilig parsen (JSON/text fallback)
     - bij fout: bruikbare boodschap opbouwen uit `error`, `message`, `details`, statuscode
   - Zo ziet de gebruiker echte fouttekst i.p.v. `[object Object]`.

4. **Backward-safe fallback in proxy (aanbevolen)**
   - In `supabase/functions/sellqo-customer-proxy/index.ts` JSON body parsen.
   - Als `tenant_id === "vanxcel"`, server-side remappen naar UUID vóór forward naar upstream.
   - Zo blijven ook oudere clients of gecachete builds werken.

## Validatie (end-to-end)
1. Nieuwe registratie op `/login` (publieke site) met nieuw e-mailadres.
2. Direct daarna inloggen met hetzelfde account.
3. Wachtwoord reset request testen.
4. In accountprofiel opslaan testen (voornaam/achternaam + bedrijfsvelden in account-tab).
5. Console/netwerk check: geen 500 meer op `sellqo-customer-proxy`.

## Impact
- Geen database migraties nodig.
- Alleen integratie/auth client + (aanbevolen) proxy-hardening.
- Dit lost de huidige blocker op zonder wijzigingen aan checkout/product API flows.
