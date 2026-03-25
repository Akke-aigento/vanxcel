

## Bugfix: Motorisatie-gaten + Fallback + "Ander voertuig"

### Drie onderdelen:

---

### 1. Database: Ontbrekende motorisaties toevoegen

Insert ~9 nieuwe motorisaties + 1 waarschuwing via de insert tool:

| Voertuig | Motor | Jaren |
|---|---|---|
| UAZ Bukhanka | 2.5 UMZ-451 (dynamo) | 1965-1985 |
| UAZ Bukhanka | 2.9 UMZ-4218 | 1985-2008 |
| Toyota LC70 | 3.4L 3B Diesel | 1984-1990 |
| Toyota LC70 | 4.2L 1HZ Diesel | 1990-2007 |
| Citroën Type H | 1.9L Traction (dynamo) | 1947-1963 |
| VW T3 | 2.0 Boxer luchtgekoeld | 1979-1982 |
| Toyota LiteAce | 2.0 Benzine 3Y | 1985-1992 |
| Renault Estafette | 0.8L Ventoux (dynamo) | 1959-1962 |
| Fiat Scudo III | 2.0 BlueHDi 145pk | 2022-heden |

Plus UAZ dynamo-waarschuwing voor 1965-1985 en sort_order updates voor bestaande motoren.

---

### 2. Fallback logica in de motorisatie-stap

**`src/hooks/use-configurator.ts`** — Wijzig `useMotorisations` hook:
- Haal ALLE motorisaties op voor het voertuig (zonder client-side jaar-filter)
- Return zowel de gefilterde als alle motors

**`src/components/configurator/StepMotorisationSelect.tsx`** — Voeg fallback logica toe:
- Filter eerst op exacte jaar-match
- Als geen match: sorteer op "afstand" tot het bouwjaar, toon top 1-2
- Toon oranje waarschuwingsbanner: "Geen exacte motordata voor bouwjaar [jaar]. We tonen de dichtstbijzijnde specificatie(s). Controleer je alternator fysiek."

---

### 3. "Ander voertuig" optie in merkselectie

**`src/components/configurator/StepBrandSelect.tsx`** — Voeg een extra kaart toe onderaan:
- Label: "Ander voertuig"
- Icoon: vraagteken of plus
- Klikhandler: `onSelect("__other__")`

**`src/components/configurator/StepOtherVehicle.tsx`** — Nieuw component:
- 3 vragen: smart alternator (ja/nee/weet niet), spanning (12V/24V), grootte (klein/medium/groot/extra groot)
- Bij "weet niet" smart alternator: uitleg met multimeter test
- Bij 24V: waarschuwing dat VanXcel alleen 12V is
- Sla antwoorden op in state en ga naar stap 6 (usage type)

**`src/components/configurator/ConfiguratorWizard.tsx`** — Aanpassingen:
- Herken `brand === "__other__"` en routeer naar `StepOtherVehicle` i.p.v. model/body/year/motor stappen
- Na StepOtherVehicle: spring naar subStep 6 (usage type)
- ConfiguratorState uitbreiden met `isOtherVehicle`, `otherSmartAlternator`, `otherVoltage`, `otherSize`
- In latere stappen (results, package, install guide): check `isOtherVehicle` en verberg voertuig-specifieke content

**Vertalingen** — 4 taalbestanden: ~15 nieuwe keys voor "ander voertuig", fallback message, smart alternator vraag, spanning vraag, grootte vraag.

---

### Bestanden

| Bestand | Wijziging |
|---|---|
| Database | 9 motorisaties insert + 1 waarschuwing + sort_order updates |
| `src/hooks/use-configurator.ts` | useMotorisations retourneert alle motors + exacte matches |
| `src/components/configurator/StepMotorisationSelect.tsx` | Fallback logica + waarschuwingsbanner |
| `src/components/configurator/StepBrandSelect.tsx` | "Ander voertuig" kaart |
| `src/components/configurator/StepOtherVehicle.tsx` | Nieuw: 3 vragen voor onbekend voertuig |
| `src/components/configurator/ConfiguratorWizard.tsx` | State uitbreiden + routing voor "other" |
| `src/i18n/locales/{nl,en,de,fr}.json` | ~15 nieuwe keys |

