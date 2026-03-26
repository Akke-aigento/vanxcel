

## Configurator Vertalingen — Grondige Fix

### Probleem
Er zijn 5 bronnen van onvertaalde content in de configurator:

1. **Database: `vehicle_warnings`** — `title`, `description`, `solution` staan alleen in het Nederlands. Geen meertalige kolommen.
2. **Database: `appliances`** — heeft `name` (Engels) en `name_nl` (Nederlands), maar geen `name_en`, `name_de`, `name_fr`. Code gebruikt `name_nl` hardcoded.
3. **Database: `vehicle_battery_locations`** — `label`, `mounting_notes`, `selfbuild_notes` alleen Nederlands.
4. **Database: `vehicle_cable_routes`** — `description`, `hazards` alleen Nederlands.
5. **Hardcoded Nederlands in code**:
   - `vanxcel-products.ts`: alle `configuratorUse` strings (~30 stuks) en sommige `name` velden in het Nederlands
   - `configurator-package.ts`: alle `reason` strings (~20 stuks) + `savingsHighlight` in het Nederlands
   - `configurator-calculations.ts`: `converterWarning` string in het Nederlands
   - `StepInstallGuide.tsx`: "Laden..." hardcoded (regel 223)
   - `StepAppliances.tsx`: `PRESELECTION` gebruikt Engelse `name` keys maar matcht op `name` kolom

### Aanpak

De database-content (warnings, battery locations, cable routes) is technische voertuigdata die zelden wijzigt. De beste aanpak is **i18n keys in code** voor de hardcoded strings, en **meertalige kolommen in de database** voor dynamische content.

#### Stap 1: Database migratie — meertalige kolommen toevoegen
- `vehicle_warnings`: voeg `title_en`, `title_de`, `title_fr`, `description_en`, `description_de`, `description_fr`, `solution_en`, `solution_de`, `solution_fr` toe (nullable, fallback op bestaande NL kolom)
- `appliances`: voeg `name_en`, `name_de`, `name_fr` toe (nullable, fallback op `name_nl` → `name`)
- `vehicle_battery_locations`: voeg `label_en`, `mounting_notes_en` etc. toe (nullable)
- `vehicle_cable_routes`: voeg `description_en` etc. toe (nullable)

#### Stap 2: Helper functie voor taalafhankelijke DB-kolommen
Maak een utility `getLocalized(row, field, lang)` die `field_nl`, `field_en` etc. probeert en terugvalt op het basisveld.

#### Stap 3: `vanxcel-products.ts` — configuratorUse vertalen
Verplaats alle `configuratorUse` strings naar i18n keys per product SKU:
```
configurator.product.VX1000CV.use: "Voor systemen tot 1000W continu..."
configurator.product.VX1000CV.use_en: "For systems up to 1000W continuous..."
```
Of beter: gebruik een `configuratorUseKey` per product die verwijst naar een i18n key.

#### Stap 4: `configurator-package.ts` — reason strings vertalen
Alle hardcoded Nederlandse `reason` strings vervangen door `t()` calls. Dit vereist dat `generatePackage` een `t` functie meekrijgt als parameter, of dat de reasons i18n keys worden die in de component vertaald worden.

#### Stap 5: `configurator-calculations.ts` — warning string vertalen
De `converterWarning` string vervangen door een i18n key + interpolatie.

#### Stap 6: Components updaten
- `StepAppliances.tsx`: gebruik `getLocalized(item, 'name', lang)` i.p.v. hardcoded `name_nl`
- `StepWarnings.tsx`: gebruik `getLocalized(w, 'title', lang)` etc.
- `StepInstallGuide.tsx`: idem voor warnings, battery locations, cable routes
- `StepResults.tsx`: `configuratorUse` via i18n
- `StepPackage.tsx`: `reason` en `savingsHighlight` via i18n

#### Stap 7: Vertalingsbestanden uitbreiden
~80 nieuwe keys toevoegen aan `nl.json`, `en.json`, `de.json`, `fr.json` voor:
- Product configuratorUse teksten (~30 producten)
- Package reason strings (~20)
- Converter warning
- Savings highlight
- "Laden..." → t("configurator.loading")

### Bestanden

| Bestand | Wijziging |
|---|---|
| Database migratie | Meertalige kolommen toevoegen aan 4 tabellen |
| `src/lib/vanxcel-products.ts` | `configuratorUse` → i18n key per SKU |
| `src/lib/configurator-package.ts` | Reason strings + savingsHighlight via i18n keys |
| `src/lib/configurator-calculations.ts` | Warning string via i18n key |
| `src/lib/configurator-i18n.ts` | Nieuw: `getLocalized()` helper |
| `src/components/configurator/StepAppliances.tsx` | `name_nl` → getLocalized |
| `src/components/configurator/StepWarnings.tsx` | title/description/solution → getLocalized |
| `src/components/configurator/StepInstallGuide.tsx` | DB content via getLocalized + "Laden..." fix |
| `src/components/configurator/StepResults.tsx` | configuratorUse via i18n |
| `src/components/configurator/StepPackage.tsx` | reason + savingsHighlight via i18n |
| `src/i18n/locales/{nl,en,de,fr}.json` | ~80 nieuwe keys |

### Prioriteit
Dit is een groot stuk werk. De meest impactvolle quick-win is:
1. **Code-hardcoded strings** (stap 3-5-7): direct te fixen, geen DB migratie nodig
2. **Appliances name** (stap 6): kleine fix, DB heeft al `name` (EN) en `name_nl`
3. **DB migratie** (stap 1-2): kan later, met fallback op NL werkt alles nog

Ik stel voor om eerst stap 3-7 te doen (code + i18n keys), dan stap 6 (appliances name fix), en de DB migratie als aparte stap.

