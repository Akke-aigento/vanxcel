

## Configurator Stap 3: Verbruikers Selectie

### Overzicht
Na subStep 9 (stap 2 compleet) komt subStep 10: de verbruikers selectie. Gebruikers selecteren apparaten uit de `appliances` tabel, passen uren aan, en zien live hun dagverbruik berekend in een sticky footer.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `src/components/configurator/StepAppliances.tsx` | Hoofdcomponent: fetcht appliances, groepeert per categorie, accordion layout, toggle + slider per item, sticky footer met live berekening |

### Hoe het werkt

**Data**: `useQuery` fetcht alle appliances, gegroepeerd op `category` in vaste volgorde: koeling, verwarming, keuken, verlichting, comfort, werk, veiligheid, water.

**State**: Intern een `Map<string, { enabled: boolean; hours: number }>` per appliance ID. Bij mount: automatische pre-selectie op basis van `usageType` uit de configurator state:
- `weekend`: koelbox, LED strip, USB, smartphone
- `regular`: koelkast 40L, LED strip, spots, USB, smartphone, laptop, waterpomp, ventilator, diesel heater
- `fulltime`: koelkast 60L, alles van regular + inductie, boiler, CO melder, leeslamp
- `stealth`: USB, smartphone, LED strip

Matching via de `name` veld (Engels).

**Per appliance rij**:
- Lucide icon (dynamisch uit `icon` veld) + `name_nl`
- Toggle switch (aan/uit)
- Als aan: slider voor uren (0.5-24, stap 0.5), default uit `daily_hours_typical`
- Berekend: `wattage_typical × uren = XXX Wh/dag` rechts
- Badge "230V" als `requires_inverter = true`
- Badge "Aanbevolen" als `is_essential = true`

**Sticky footer bar** (altijd zichtbaar onderaan viewport):
- Totaal dagelijks verbruik: XXXX Wh/dag
- 12V: XXX Wh | 230V: XXX Wh
- Aantal 230V apparaten + "Omvormer nodig" indicator
- Max gelijktijdig 230V vermogen (som peak wattages)
- "Volgende stap" button

**Output**: Bij klik op Volgende, sla `selectedAppliances` (array met id, hours, wh) en `totalDailyWh` op in configurator state.

### ConfiguratorWizard aanpassen

- State uitbreiden met `selectedAppliances` en `totalDailyWh`
- subStep 9: was "stap 2 complete" placeholder, wordt nu de trigger naar subStep 10
- subStep 10: `StepAppliances` component
- De "Volgende stap" button in subStep 9 navigeert naar subStep 10

### VehicleSummaryBar uitbreiden
Nieuwe crumb voor "Verbruikers" met het totale Wh/dag.

### i18n keys toevoegen
Nieuwe keys in `configurator` sectie voor alle 4 talen:
- `appliancesTitle`, `appliancesSubtitle`
- Categorie labels: `catKoeling`, `catVerwarming`, etc.
- `hoursPerDay`, `whPerDay`, `totalDaily`, `of12v`, `of230v`, `inverterNeeded`, `maxSimultaneous`, `recommended`, `appliancesSummary`

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/configurator/StepAppliances.tsx` | Nieuw |
| `src/components/configurator/ConfiguratorWizard.tsx` | State uitbreiden, subStep 9→10 flow |
| `src/components/configurator/VehicleSummaryBar.tsx` | Crumb voor verbruikers |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

