

## Configurator Stap 2: Gebruik & Levensstijl

### Overzicht
Na de voertuigselectie (subStep 0-5) komen 3 nieuwe sub-stappen (6, 7, 8) voor gebruik, klimaat en personen. Na stap 8 toont een samenvatting + "Volgende stap" button.

### State uitbreiden in `ConfiguratorWizard.tsx`

Nieuwe velden in `ConfiguratorState`:
```typescript
usageType: string | null;    // weekend, regular, fulltime, stealth
climate: string | null;      // benelux, southern_europe, scandinavia, all_season
persons: number | null;      // 1, 2, 4, 5
```

Na voltooiing van Stap 1 (warnings + next button bij subStep 5) → subStep 6.

### Nieuwe componenten

| Bestand | Beschrijving |
|---|---|
| `src/components/configurator/StepUsageType.tsx` | 2x2 grid met 4 usage kaarten (Tent, Compass, Home, EyeOff icons) |
| `src/components/configurator/StepClimate.tsx` | 4 kaarten met klimaatzones + zon-uren info |
| `src/components/configurator/StepPersons.tsx` | 4 keuzes: 1 / 2 / 3-4 / 5+ met Users icon |

Elke kaart: klikbaar, selected state = `border-primary` + `Check` icon overlay, dezelfde stijl als de bestaande stappen.

### Flow

- subStep 6: UsageType selectie → klik → subStep 7
- subStep 7: Climate selectie → klik → subStep 8
- subStep 8: Persons selectie → klik → samenvatting + "Volgende stap" button

### VehicleSummaryBar uitbreiden
Voeg crumbs toe voor usageType, climate, persons na de bestaande voertuig-crumbs.

### Bestaande bestanden aanpassen

| Bestand | Wijziging |
|---|---|
| `src/components/configurator/ConfiguratorWizard.tsx` | State uitbreiden, 3 nieuwe subSteps (6-8), next button van stap 5 triggert subStep 6 |
| `src/components/configurator/VehicleSummaryBar.tsx` | Extra crumbs voor usage/climate/persons |
| `src/i18n/locales/nl.json` | Nieuwe `configurator.usage*`, `configurator.climate*`, `configurator.persons*` keys |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

### i18n keys (voorbeeld NL)
```json
"usageTitle": "HOE GA JE JE BUS GEBRUIKEN?",
"usageWeekend": "Weekend Explorer",
"usageWeekendDesc": "Weekendjes weg en korte vakanties. 2-5 dagen zonder stroom.",
"usageRegular": "Actieve Camper",
"usageRegularDesc": "Regelmatig op pad, 1-2 weken per trip. Comfort is belangrijk.",
"usageFulltime": "Full-Time Vanlife",
"usageFulltimeDesc": "Je bus is je thuis. Alles moet werken, altijd.",
"usageStealth": "Minimal Stealth",
"usageStealthDesc": "Zo onopvallend mogelijk. Alleen het absolute minimum.",
"climateTitle": "WAAR GA JE VOORAL RIJDEN?",
"climateBenelux": "Benelux / West-Europa",
"climateBeneluxDesc": "Gemiddeld 3.5 zon-uren per dag voor je panelen",
"climateSouth": "Zuid-Europa",
"climateSouthDesc": "Gemiddeld 5 zon-uren per dag — ideaal voor solar",
"climateNorth": "Scandinavië / Noord-Europa",
"climateNorthDesc": "Gemiddeld 2.5 zon-uren — meer afhankelijk van alternator",
"climateAll": "Alle seizoenen / Overal",
"climateAllDesc": "We rekenen met 3 zon-uren als veilige basis",
"personsTitle": "MET HOEVEEL PERSONEN?",
"persons1": "1 persoon",
"persons2": "2 personen",
"persons34": "3-4 personen",
"persons5": "Gezin (5+)"
```

