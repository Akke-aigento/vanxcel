

## Locale detectie toevoegen aan SellQo client

### Wijzigingen

**1. `src/integrations/sellqo/client.ts`**
- Voeg een module-level `locale` variabele toe (default `'nl'`)
- Voeg `setSellqoLocale(locale: string)` export functie toe
- Voeg `detectLocale()` export functie toe (hostname-based)
- Voeg `Accept-Language: ${locale}` header toe aan `sellqoFetch`

**2. `src/main.tsx`**
- Import `detectLocale` en `setSellqoLocale` uit de client
- Roep `setSellqoLocale(detectLocale())` aan vóór `createRoot`

Geen andere bestanden worden aangepast.

