

## Ontbrekende i18n Keys Toevoegen

De code compileert nu zonder fouten, maar de nieuwe StepResults en StepPackage componenten verwijzen naar ~25 vertaalkeys die nog niet bestaan in de locale bestanden. Hierdoor worden raw key-strings getoond in de UI in plaats van vertalingen.

### Ontbrekende keys (gevonden in StepResults.tsx + StepPackage.tsx)

**StepResults — nieuwe converter/alternator kaarten:**
- `converterTitle`, `converterSubtitle`, `converterInverter`, `converterDcDc`, `converterMppt`, `converterMpptMax`, `converterShore`, `converterPrice`
- `altChargeTitle`, `altChargeSubtitle`, `altChargeDesc`
- `solarConverterDirect`

**StepPackage — beschikbaarheid/notificatie/besparing:**
- `directlyAvailable`, `comingSoonLabel`, `totalSystem`
- `savingsHighlight`
- `notifyMe`, `notifySuccess`, `notifyPlaceholder`
- `addToCart`, `outOfStock`
- `packageCatConverter`, `packageCatSafety`, `packageCatPanel`

### Bestanden te bewerken

| Bestand | Actie |
|---|---|
| `src/i18n/locales/nl.json` | ~25 nieuwe keys toevoegen in `configurator` sectie |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

### Aanpak

Voeg alle ontbrekende keys toe aan de bestaande `configurator` sectie in elk locale bestand. Geen code-wijzigingen nodig — alleen vertalingen.

