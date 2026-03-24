

## Fix kabeldikte-berekeningen in Installatiegids

### Probleem
De `calcCableSize()` functie in `StepInstallGuide.tsx` berekent puur wiskundig, zonder minimumwaarden per circuittype. Resultaat: gevaarlijk dunne kabels (bijv. 4mm² als accukabel).

### Aanpak

**1. Nieuwe functie `getMinCableSize()` in StepInstallGuide.tsx**

Bepaalt het minimum per circuittype op basis van de systeemwaarden:

| Circuit ID | Conditie | Minimum mm² |
|---|---|---|
| `starter_to_dcdc` | ≤30A: 10, ≤50A: 16, >50A: 25 |
| `dcdc_to_leisure` | Zelfde als starter_to_dcdc |
| `solar_to_mppt` | ≤200Wp: 2.5, ≤400Wp: 4, >400Wp: 6 |
| `battery_to_fusebox` | ≤1000Wh/dag: 16, >1000Wh/dag: 25 |
| `battery_to_inverter` | ≤1000W: 25, ≤2000W: 35, >2000W: 50 |
| `mppt_to_battery` | ≤20A: 6, ≤40A: 10, >40A: 16 |

**2. Update `cablingRows` array**

Elk row krijgt een `circuitId` veld. De weergegeven kabeldikte wordt `Math.max(calcCableSize(...), getMinCableSize(circuitId))`.

**3. Voeg MPPT → Batterij rij toe** (ontbreekt nu)

**4. Waarschuwing per zware kabel**

Als resultaat ≥ 16mm²: toon "Gebruik gelaste of geperste kabelschoenen" tekst in de tabelcel.

**5. Algemene waarschuwing bovenaan bekabelingssectie**

Alert banner: "Alle genoemde kabeldiktes zijn MINIMUM waarden. Bij twijfel: kies altijd een maat dikker."

**6. i18n keys toevoegen** (4 talen)

- `cableSafetyNote`: de algemene waarschuwing
- `cableLugWarning`: kabelschoenen waarschuwing
- `cableMppt` / `cableMpptToBattery`: labels voor nieuwe rij

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/configurator/StepInstallGuide.tsx` | Minimumlogica, MPPT→batterij rij, waarschuwingen |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

