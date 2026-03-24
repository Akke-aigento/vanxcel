

## Configurator Stap 6: Installatiegids (subStep 14)

### Overzicht
Na het productpakket (subStep 13) komt subStep 14: een technische installatiegids met voertuig-specifieke data uit 4 Supabase tabellen. De StepPackage krijgt een "Volgende" button die naar subStep 14 navigeert.

### Nieuw bestand

| Bestand | Beschrijving |
|---|---|
| `src/components/configurator/StepInstallGuide.tsx` | Volledige installatiegids met 5 secties + tips |

### Data hooks toevoegen aan `use-configurator.ts`

3 nieuwe hooks:
- `useBatteryLocations(vehicleId)` — fetcht `vehicle_battery_locations`
- `useCableRoutes(vehicleId)` — fetcht `vehicle_cable_routes`
- `useGroundingPoints(vehicleId)` — fetcht `vehicle_grounding_points`

De bestaande `useVehicleWarnings` hook wordt hergebruikt.

### Component: StepInstallGuide

Props: `state: ConfiguratorState`, `onBack: () => void`

Intern berekent het de systeem-waarden (batteryAh, solarWp, inverterW, dcDcA) via de bestaande `configurator-calculations.ts` functies, en fetcht de voertuig-specifieke data.

**5 secties:**

1. **Waarschuwingen** — hergebruikt `useVehicleWarnings`, alert banners (rood/oranje/blauw per severity)

2. **Batterij locaties** — `useBatteryLocations`, kaarten met afmetingen, montage-instructies, geschiktheidsbadge, populariteit-sortering

3. **Kabelroutes** — `useCableRoutes`, Collapsible/Accordion kaarten met route beschrijving, afstand, moeilijkheidsgraad (groen/geel/rood badge), aanbevolen kabeldikte berekend op basis van dcDcA, gereedschappen lijst, gevaren

4. **Aardpunten** — `useGroundingPoints`, simpele lijst met locatie, bout maat, max kabeldikte, bestaand/nieuw indicator

5. **Bekabelingsoverzicht** — berekende tabel met alle kabels. Formule: `mm² = (I × L × 2) / (0.36 × 56)` afgerond naar standaard maten (4, 6, 10, 16, 25, 35, 50 mm²). Rijen:
   - Starterbatterij → DC-DC (afstand uit cable_routes of 1.0m default)
   - DC-DC → Leisurebatterij (0.5m)
   - Zonnepaneel → MPPT (uit cable_routes of 3.5m)
   - Batterij → Zekeringkast (0.3m)
   - Batterij → Omvormer (0.5m, alleen als inverter > 0)

**Onderaan:** 4 tips als een grid van info-cards.

### ConfiguratorWizard aanpassen

- StepPackage krijgt een `onNext` prop
- subStep 14: render `StepInstallGuide`
- Import toevoegen

### VehicleSummaryBar

Crumb "✓ Installatiegids" bij subStep >= 14.

### i18n keys (alle 4 talen)

Nieuwe keys in `configurator` sectie:
- `installTitle`, `installSubtitle`
- `warningsSection`, `batteryLocationSection`, `cableRoutesSection`, `groundingSection`, `cablingOverview`
- `location`, `dimensions`, `mountingNotes`, `suitability`
- `routeDistance`, `difficulty`, `difficultyEasy`, `difficultyModerate`, `difficultyHard`
- `recommendedCableSize`, `toolsRequired`, `hazards`
- `boltSize`, `maxCableSize`, `existingGround`, `needsDrilling`
- `from`, `to`, `distance`, `cableSize`, `current`, `type`
- `tipFuse`, `tipLabel`, `tipTest`, `tipPhotos`, `installTips`

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/configurator/StepInstallGuide.tsx` | Nieuw |
| `src/hooks/use-configurator.ts` | 3 nieuwe hooks |
| `src/components/configurator/ConfiguratorWizard.tsx` | subStep 14 + StepPackage onNext |
| `src/components/configurator/StepPackage.tsx` | onNext prop + "Volgende" button |
| `src/components/configurator/VehicleSummaryBar.tsx` | Crumb voor installatiegids |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

