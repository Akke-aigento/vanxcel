

## Configurator Stap 4: Automatische Berekening

### Overzicht
Na subStep 11 (stap 3 compleet) komt subStep 12: een visueel dashboard met 4 geanimeerde kaarten die het complete energiesysteem berekenen op basis van alle voorgaande stappen.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `src/lib/configurator-calculations.ts` | Pure berekeningsfuncties: battery, solar, inverter, DC-DC sizing |
| `src/components/configurator/StepResults.tsx` | Dashboard met 4 resultaatkaarten + samenvatting + "pas aan" link |

### Berekeningslogica (`src/lib/configurator-calculations.ts`)

4 pure functies:
- `calculateBattery(totalDailyWh, usageType)` → Ah (afgerond naar 50/100/200/300/400)
- `calculateSolar(totalDailyWh, climate, maxSolarM2)` → Wp (afgerond naar 100)
- `calculateInverter(selectedApplianceIds, allAppliances)` → W (0/300/600/1000/1500/2000/3000)
- `calculateDcDc(motorisation, batteryAh)` → A (20/30/50/60)

Plus helpers: `getDaysAutark(usageType)`, `getSunHours(climate)`, `getDailySolarYield(wp, climate)`.

### StepResults component

**4 grote kaarten in 2x2 grid**, elk met:
- Kleur-gecodeerde accent border (groen/geel/blauw/oranje)
- CountUp animatie voor het grote getal
- Staggered fade-in (100ms delay per kaart)

**Kaart 1 — Batterij (groen)**:
- Groot: "200 Ah LiFePO4"
- Sub: "XXXX Wh/dag × X dagen autonomie"
- Progress bar: dagelijks verbruik als % van capaciteit
- Tekst: "X dagen zonder externe stroom"

**Kaart 2 — Zonnepanelen (geel)**:
- Groot: "400 Wp"
- Sub: "Xx 200W panelen" (berekend)
- Tekst: "Levert gemiddeld XXXX Wh/dag op in [klimaat]"
- Waarschuwing als dak te klein: "Max XXX Wp past op je dak"

**Kaart 3 — Omvormer (blauw)**:
- Groot: "2000W" of "Niet nodig"
- Sub: "Pure sine wave omvormer"
- Tekst: "X apparaten op 230V, piek XXXX W"

**Kaart 4 — DC-DC Lader (oranje)**:
- Groot: "50A"
- Sub: "DC-DC lader" + "(verplicht)" als smart alt
- Rode banner als smart alternator
- Tekst: "Laadt via je XXA alternator"

**Onderaan**: compacte samenvattrij + "Pas je verbruikers aan" link (→ subStep 10)

### ConfiguratorWizard aanpassen

- subStep 11 "next" button → subStep 12
- subStep 12: `StepResults` met alle benodigde props (state, appliances)
- StepResults fetcht appliances zelf (voor peak wattage berekening)

### VehicleSummaryBar
Optioneel: crumb met "✓ Berekening" bij subStep 12.

### i18n keys
Nieuwe keys in `configurator` sectie voor alle 4 talen:
- `resultsTitle`, `batteryTitle`, `solarTitle`, `inverterTitle`, `dcDcTitle`
- `basedOn`, `daysAutark`, `panelCount`, `solarYield`, `roofWarning`
- `inverterNotNeeded`, `peakPower`, `dcDcRequired`, `dcDcRecommended`
- `chargesVia`, `adjustAppliances`, `summaryLabel`

### Bestanden

| Bestand | Actie |
|---|---|
| `src/lib/configurator-calculations.ts` | Nieuw |
| `src/components/configurator/StepResults.tsx` | Nieuw |
| `src/components/configurator/ConfiguratorWizard.tsx` | subStep 11→12 flow, import StepResults |
| `src/components/configurator/VehicleSummaryBar.tsx` | Crumb voor berekening |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

