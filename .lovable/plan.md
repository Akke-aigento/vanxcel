

## Login/Registratie & Account Pagina's Redesign + Adres Autocomplete

### Overzicht
Vier onderdelen: (1) visueel redesign Login pagina, (2) visueel redesign Account pagina, (3) TomTom adres-autocomplete bij adressen, (4) land-dropdown i.p.v. tekstveld.

### BTW/VIES Validatie — Status
De VIES validatie werkt al. Wanneer een klant via de Account-pagina zijn profiel opslaat met een BTW-nummer, stuurt de Sellqo backend dit automatisch door naar de `validate-vat` edge function. Bij success wordt `vat_verified` op `true` gezet en de UI toont al de "✓ Geverifieerd" badge. Hier hoeft niets te veranderen.

---

### 1. Login/Registratie Pagina — Visueel Redesign

**`src/pages/Login.tsx`** — Van saaie centered card naar cinematic split-screen:

- **Links (60%)**: Donkere hero-achtige sectie met een grote lifestyle-afbeelding (campervan), gradient overlay, VanXcel logo, en een inspirerende tagline ("Power Your Journey")
- **Rechts (40%)**: Het formulier op een glassmorphism card met subtiele border-glow in brand teal
- **Mobile**: Afbeelding als achtergrond met semi-transparante card overlay
- **Details**: Animated tab-switch, floating labels, teal focus-glow op inputs, password strength indicator bij registratie

### 2. Account Pagina — Visueel Redesign

**`src/pages/Account.tsx`** — Van boring tabbed layout naar een premium dashboard:

- **Header**: Grote welkomstbanner met gradient achtergrond, avatar initialen-cirkel, klantnaam prominent
- **Sidebar navigatie** (desktop) i.p.v. horizontale tabs — met iconnen en actieve state highlight
- **Mobile**: Bottom-navigation of collapsible menu
- **Cards**: Elke sectie in een glassmorphism card met subtiele animaties
- **Profiel tab**: Nettere layout met secties (Persoonlijk / Bedrijf / Voorkeuren) gescheiden door dividers
- **Bestellingen tab**: Uitklapbare order-cards met productregels, tracking status timeline
- **Adressen tab**: Visuele address-kaarten met een kaart-icon en land-vlag

### 3. Adres Autocomplete via TomTom

**Nieuw: `supabase/functions/address-autocomplete/index.ts`**
- Eigen edge function die de TomTom Search API aanroept (zelfde logica als Sellqo's `validate-address`)
- Heeft een `TOMTOM_API_KEY` secret nodig → moet eerst worden toegevoegd
- Twee modes: `query` (autocomplete) en `street+city+postal` (validatie)

**Nieuw: `src/hooks/use-address-autocomplete.ts`**
- Hook met debounced zoekveld (300ms)
- Roept de edge function aan en retourneert suggesties
- Bij selectie vult het formulier automatisch in (straat, huisnummer, postcode, stad, land)

**`src/pages/Account.tsx` — AddressesTab**
- Vervang het huidige adresformulier door een zoekveld bovenaan
- Gebruiker typt adres → dropdown met TomTom suggesties
- Bij klik op suggestie: alle velden worden ingevuld
- Handmatige invoer blijft mogelijk als fallback

### 4. Land-dropdown

**`src/components/ui/CountrySelect.tsx`** — Nieuw component
- Dropdown met Europese landen (BE, NL, DE, FR, AT, LU, etc.)
- Landnaam + vlag-emoji
- Vervangt het tekstveld in het adresformulier

### Vereiste Secret
- `TOMTOM_API_KEY` — moet worden toegevoegd voordat de address autocomplete werkt

### Vertalingen
- ~20 nieuwe keys in alle 4 taalbestanden voor de nieuwe UI-elementen

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/Login.tsx` | Volledig redesign: split-screen layout |
| `src/pages/Account.tsx` | Volledig redesign: dashboard-stijl met sidebar |
| `supabase/functions/address-autocomplete/index.ts` | Nieuw: TomTom proxy |
| `src/hooks/use-address-autocomplete.ts` | Nieuw: debounced autocomplete hook |
| `src/components/ui/CountrySelect.tsx` | Nieuw: land-dropdown |
| `src/i18n/locales/{nl,en,de,fr}.json` | Nieuwe vertalingskeys |

