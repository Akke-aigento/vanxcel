

## Fact-Check Correcties — Database Updates

### Status check
- **FIX 4 (Ducato L3 wielbasis)**: Al correct in database (4035mm). ✅ Geen actie nodig.
- **FIX 9 (Vito batterijlocatie)**: Al een waarschuwing aanwezig ("Starterbatterij locatie verschilt per variant"). Batterijlocatie in motorisatie is "engine_bay" — update naar "varies".

### Uit te voeren fixes

**FIX 1: VW T5 smart alternator waarschuwing + BMT motorisatie**
- UPDATE warning `aafabbcd-...` met nieuwe title/description/solution
- INSERT nieuwe motorisatie CAAC_140_BMT voor T5 (vehicle_id: `a1b2c3d4-1111-4000-8000-000000000015`)

**FIX 2: Sprinter VS30 starterbatterij locatie**
- UPDATE 3 motorisaties (`3bdc4d65`, `551ae168`, `13592f82`): starter_battery_location → "under_cab_floor_driver"
- INSERT nieuwe waarschuwing (noodbatterij ≠ starterbatterij)

**FIX 3: Jumper + Boxer vroege 2.2 HDi motorisatie**
- INSERT 2 motorisaties (DW10_130_HDI) voor Jumper (`4a0eb30a`) en Boxer (`0950836e`)
- UPDATE 2 "technisch identiek" waarschuwingen (`50029deb`, `07baf6c3`) met genuanceerde tekst

**FIX 5: Ford Transit Custom startjaar**
- UPDATE vehicle `8bd3280e`: production_year_start → 2012

**FIX 6: Gewichtswaarschuwing**
- Dit is een globale tip voor de installatiegids — INSERT als waarschuwing op alle grote voertuigen of implementeer als hardcoded tip in de install guide component. Beter: voeg als i18n-tekst toe aan de installatiegids.

**FIX 7: Universele alternator check-tip**
- Append tekst aan notes van alle conventionele-alternator motorisaties (~29 records)

**FIX 8: T6 alternator output variatie**
- UPDATE notes van 3 T6 motorisaties + 2 T6.1 motorisaties

**FIX 9: Vito batterijlocatie**
- UPDATE motorisatie `bbe7eb16`: starter_battery_location → "varies"

### Technische details

Alle wijzigingen via de Supabase insert tool (UPDATE/INSERT operaties). Geen schema-wijzigingen nodig.

| Fix | Operatie | Records |
|---|---|---|
| 1 | UPDATE 1 warning + INSERT 1 motorisatie | 2 |
| 2 | UPDATE 3 motorisaties + INSERT 1 warning | 4 |
| 3 | INSERT 2 motorisaties + UPDATE 2 warnings | 4 |
| 5 | UPDATE 1 vehicle | 1 |
| 6 | Toevoegen als i18n key in installatiegids component | 4 taalbestanden |
| 7 | UPDATE ~29 motorisatie notes | ~29 |
| 8 | UPDATE 5 motorisatie notes (T6 + T6.1) | 5 |
| 9 | UPDATE 1 motorisatie | 1 |

**Totaal: ~46 database operaties + 4 taalbestanden voor de gewichtswaarschuwing**

### Bestanden
| Bestand | Wijziging |
|---|---|
| Database | ~46 UPDATE/INSERT operaties |
| `src/i18n/locales/{nl,en,de,fr}.json` | Gewichtswaarschuwing key voor installatiegids |
| `src/components/configurator/StepInstallGuide.tsx` | Gewichtswaarschuwing tonen |

