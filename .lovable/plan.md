

## Configurator Vertalingen Audit & Fix

### Probleem

De configurator heeft twee soorten vertaalproblemen:

**A. Hardcoded Nederlandse tekst in componenten** (niet via `t()`)
**B. Ontbrekende vertaalkeys in sommige taalbestanden**

### A. Hardcoded tekst die naar `t()` moet

| Bestand | Hardcoded tekst | Nieuwe key |
|---|---|---|
| `StepResults.tsx:197` | `"Laden..."` | `configurator.loading` |
| `StepAppliances.tsx:244` | `"Laden..."` | `configurator.loading` |
| `StepPackage.tsx:101` | `"Laden..."` | `configurator.loading` |
| `StepPackage.tsx:312` | `{t("configurator.day")}verbruik` (concatenatie) | `configurator.dailyConsumption` |
| `WiringDiagram.tsx:321` | `"Cabine"` | `configurator.cabin` |
| `WiringDiagram.tsx:325` | `"Laadruimte"` | `configurator.cargoArea` |
| `WiringDiagram.tsx:347` | `"Schuifdeur"` | `configurator.slidingDoor` |
| `WiringDiagram.tsx:451` | `"12V+ (positief)"` etc. | `configurator.legend12vPos` etc. |
| `WiringDiagram.tsx:463` | `"Jouw Bedradingsschema"` | `configurator.wiringTitle` |
| `WiringDiagram.tsx:466` | `"Klik op een component..."` | `configurator.wiringSubtitle` |
| `WiringDiagram.tsx:509` | `"Bedradingsschema"` | `configurator.wiringDiagram` |
| `WiringDiagram.tsx:153` | `"ANL hoofdzekering"` | `configurator.anlMainFuse` |
| `WiringDiagram.tsx:158` | `"Batterij disconnect schakelaar"` | `configurator.batterySwitch` |
| `WiringDiagram.tsx:174` | `"Zonnepaneel ..."` | `configurator.solarPanelRoof` |
| `WiringDiagram.tsx:180` | `"Walstroom inlaat (230V)"` | `configurator.shoreInlet` |
| `WiringDiagram.tsx:185` | `"Chassis aardpunt"` | `configurator.chassisGround` |
| `PhaseIllustration.tsx` | ~40 hardcoded labels | Nieuwe keys `configurator.illust*` |
| `VehicleSummaryBar.tsx:44` | `"pk"` suffix | `configurator.hpUnit` |

**PhaseIllustration.tsx** heeft ~40 hardcoded Nederlandse labels in de SVGs (o.a. "Werkbank / tafel", "Batterij", "Kabels", "Krimptang", "Boormachine", "Checklist", "Passagiersstoel", "Stoel optillen", "Montageplaat", "Schakelaar", "LOSKOPPELEN", "Dwarsdoorsnede achterkant", "Stevig bevestigen!", "Zekeringkast — vooraanzicht", "Koelkast", "Ventilator", "Negatieve Busbar", "Cabine", "Laadruimte", "Zonnepaneel (op dak)", "Scheidingswand", "Brandstofleiding", "Aansluitvolgorde", "Walstroom 230V", "LAATST aansluiten!", "Maak foto's!", "Bewaar schema", "Label zekeringen", "Bewaar in je bus", "Gefeliciteerd!", etc.)

### B. Benodigde aanpak

1. **~55 nieuwe vertaalkeys toevoegen** aan `nl.json` (NL brontekst)
2. **Dezelfde keys vertalen** naar `en.json`, `fr.json`, `de.json`
3. **PhaseIllustration refactoren**: De component accepteert `t` als prop of gebruikt `useTranslation()` intern, en vervangt alle hardcoded strings door `t()` calls
4. **WiringDiagram**: Tooltips en labels vervangen door `t()` calls (hook al geïmporteerd)
5. **3 "Laden..." strings** unifieren naar `t("configurator.loading")`
6. **StepPackage**: `{t("configurator.day")}verbruik` → `t("configurator.dailyConsumption")`

### Bestanden die gewijzigd worden

| Bestand | Actie |
|---|---|
| `src/i18n/locales/nl.json` | ~55 nieuwe keys in `configurator` sectie |
| `src/i18n/locales/en.json` | Zelfde keys, Engelse vertaling |
| `src/i18n/locales/fr.json` | Zelfde keys, Franse vertaling |
| `src/i18n/locales/de.json` | Zelfde keys, Duitse vertaling |
| `src/components/configurator/PhaseIllustration.tsx` | `useTranslation()` toevoegen, alle ~40 hardcoded strings → `t()` |
| `src/components/configurator/WiringDiagram.tsx` | ~15 hardcoded strings → `t()` |
| `src/components/configurator/StepResults.tsx` | `"Laden..."` → `t()` |
| `src/components/configurator/StepAppliances.tsx` | `"Laden..."` → `t()` |
| `src/components/configurator/StepPackage.tsx` | `"Laden..."` + dagverbruik → `t()` |
| `src/components/configurator/VehicleSummaryBar.tsx` | `"pk"` → `t()` |

### Omvang
Dit is voornamelijk zoek-en-vervang werk in ~10 bestanden. De vertaalbestanden groeien elk met ~55 regels.

