

## Klantaccount-systeem via SellQo Customer API

### Overzicht
Een compleet klantaccount-systeem dat communiceert met de SellQo `storefront-customer-api` via een nieuwe proxy edge function. Geen Supabase Auth — eigen JWT-token systeem op de SellQo storefront_customers tabel.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `supabase/functions/sellqo-customer-proxy/index.ts` | Proxy naar `storefront-customer-api`, injecteert `SELLQO_API_KEY`, forwardt `x-storefront-token` |
| `src/integrations/sellqo/customerClient.ts` | `customerApiFetch(action, params, token)` helper |
| `src/integrations/sellqo/CustomerAuthContext.tsx` | Context met customer state, token in localStorage, login/register/logout/updateProfile |
| `src/integrations/sellqo/useCustomerApi.ts` | Hook voor orders, addresses, password, wishlist calls |
| `src/pages/Login.tsx` | Tabbed login/register + "wachtwoord vergeten" link |
| `src/pages/ResetPassword.tsx` | Twee flows: email invoeren OF nieuw wachtwoord met token |
| `src/pages/Account.tsx` | Dashboard met tabs: profiel, adressen, bestellingen, wachtwoord, uitloggen |

### Bestaande bestanden aanpassen

| Bestand | Wijziging |
|---|---|
| `supabase/config.toml` | `[functions.sellqo-customer-proxy]` met `verify_jwt = false` |
| `src/App.tsx` | `CustomerAuthProvider` wrappen, routes `/login`, `/reset-password`, `/account` toevoegen |
| `src/components/Navbar.tsx` | Account-icoon: niet ingelogd → `/login`, ingelogd → dropdown (Mijn account, Uitloggen) |
| `src/i18n/locales/nl.json` | Keys voor auth, account, adressen, bestellingen |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

### Edge Function: `sellqo-customer-proxy`

- POST-only proxy naar `https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-customer-api`
- Body: `{ action, tenant_id, params }` — forwardt als-is met `X-API-Key` header
- Forwardt `x-storefront-token` header van client naar upstream
- Zelfde CORS headers als bestaande `sellqo-proxy`

### CustomerAuthContext

- State: `customer`, `token`, `isAuthenticated`, `loading`
- Token in `localStorage` key `storefront_token_vanxcel`
- Bij mount: token uit storage → `get_profile` validatie
- Functies: `login`, `register`, `logout`, `updateProfile`, `refreshProfile`

### Account pagina tabs

1. **Profiel** — naam, email (readonly), telefoon — `update_profile`
2. **Adressen** — lijst + CRUD via `get_addresses`, `add_address`, `update_address`, `delete_address`
3. **Bestellingen** — overzicht via `get_orders`, detail via `get_order`
4. **Wachtwoord** — `change_password`
5. **Uitloggen**

### Navbar integratie

- `User` icoon naast winkelwagen
- Niet ingelogd: klik → `/login`
- Ingelogd: dropdown met "Mijn account" + "Uitloggen"

### Protected route

`/account` redirect naar `/login` als niet ingelogd (check in Account.tsx zelf, geen route guard nodig).

