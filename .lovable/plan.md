

## Fix: Registratie faalt door bedrijfsvelden

### Probleem
De registratie stuurt `company_name`, `vat_number` en `newsletter_opt_in` mee naar de SellQo API, maar die accepteert deze velden niet bij registratie (alleen bij profile update). Dit veroorzaakt een 500 error.

### Oplossing

**`src/pages/Login.tsx`** — Registratieformulier vereenvoudigen:
1. Verwijder de state variabelen: `companyName`, `vatNumber`, `newsletterOptIn`
2. Verwijder de 3 formuliervelden (Bedrijfsnaam, BTW-nummer, Nieuwsbrief checkbox)
3. In `handleRegister`: stuur alleen `email`, `password`, `first_name`, `last_name` — geen `company_name`, `vat_number`, `newsletter_opt_in`

Deze velden blijven beschikbaar in de Account-pagina (profiel tab) waar ze al werken via `updateProfile()`.

### Bestanden
| Bestand | Wijziging |
|---|---|
| `src/pages/Login.tsx` | Verwijder 3 velden uit registratieformulier + bijbehorende state |

