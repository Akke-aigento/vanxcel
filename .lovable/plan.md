# SHIP-GEO-FE-1 — Dynamische verzendlandenlijst in de checkout

De checkout toont nu een vaste lijst van 25 landen. Die wordt vervangen door de landen die de winkel echt bedient, opgehaald bij de backend.

## Wat er verandert

1. **Nieuwe API-call**: `get_shipping_countries` (publiek, geen cart nodig), één keer bij het laden van de checkout, 5 minuten gecachet.
2. **Adresstap (verzend- én factuuradres)** toont uitsluitend de toegestane landen.
3. **Preselectie**: het door de backend opgegeven standaardland. Staat het opgeslagen land niet in de lijst, dan wordt er automatisch naar het standaardland gecorrigeerd.
4. **Eén toegestaan land**: geen dropdown, maar een vast label ("Verzending naar: België").
5. **Geen toegestane landen**: melding "Deze winkel verzendt momenteel niet" en de doorgaan-knop verdwijnt.
6. **Landnamen** in de actieve taal via de browser-taalnamen, Nederlands als fallback, gesorteerd op naam. Naar de API gaat altijd de ISO-2 code.
7. **Geen eigen validatie**: als de server een land alsnog weigert bij het kiezen van de verzendmethode, tonen we die servermelding letterlijk.

Het adresboek in het account blijft de volledige landenlijst tonen (dat is geen checkout-stap).

## Technisch

- `src/integrations/sellqo/api.ts`: `checkoutAPI.getShippingCountries()` → `sellqoFetch('/get_shipping_countries', { method: 'POST' })` (underscores, geen streepjes) met response `{ countries, unrestricted, default_country }`.
- Nieuwe hook `src/hooks/use-shipping-countries.ts`: react-query met `staleTime: 5 min`, geeft `{ codes, unrestricted, defaultCountry, isLoading, blocked }`.
- Nieuwe helper `src/lib/countries.ts`: `ALL_COUNTRY_CODES` (ISO-2 set, geen namen) + `localizedCountryOptions(codes, locale)` met `Intl.DisplayNames(locale, { type: 'region' })`, NL-fallback, sortering op gelokaliseerde naam.
- `src/components/ui/CountrySelect.tsx`: hardcoded `COUNTRIES`-array verwijderen; component krijgt een `codes: string[]`-prop en rendert gelokaliseerde namen; bij precies één code een read-only label. `getCountryFlag` wordt afgeleid uit de ISO-code (regional indicator letters), `getCountryName` uit `Intl.DisplayNames`, zodat `AddressesTab` blijft werken (die geeft de volledige codelijst mee).
- `src/pages/Checkout.tsx` (`StepDetailsAndAddress`): hook aanroepen, `codes` doorgeven aan beide `CountrySelect`s, init-country = opgeslagen land als geldig, anders `default_country`; effect corrigeert een ongeldige selectie; bij lege lijst blokkeermelding in plaats van de submit-knop.
- i18n-keys onder `checkout.shipsOnlyTo`, `checkout.noShippingCountries` in nl/en/fr/de.
- Slottaak: mini-entry `SHIP-GEO-FE-1` in `docs/role-audit.md`.
