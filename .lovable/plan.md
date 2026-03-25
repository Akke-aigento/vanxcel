

## Derde Golf Voertuigen Seeden

### Overzicht
10 nieuwe voertuigen toevoegen (VW T2, VW T1, Mercedes Düdo, Toyota HiAce, Dodge ProMaster, Iveco Daily, VW LT, Mitsubishi Delica, Toyota Land Cruiser 70, Citroën Type H) — totaal 28 voertuigen.

### Insert operatie over 5 tabellen

| Tabel | Nieuwe rijen |
|---|---|
| `vehicles` | 10 |
| `vehicle_body_types` | ~13 (T2 1, T1 1, Düdo 1, HiAce 2, ProMaster 2, Daily 2, LT 1, Delica 1, LC70 1, Type H 1) |
| `vehicle_motorisations` | ~12 (T2 2, T1 1, Düdo 1, HiAce 1, ProMaster 1, Daily 1, LT 1, Delica 1, LC70 1, Type H 1) |
| `vehicle_warnings` | ~19 (2-3 per voertuig) |
| `vehicle_popular_configs` | ~10 (1 per voertuig) |

**Totaal: ~64 rijen**

### Bijzonderheden
- T1 en Type H: `alternator_type: "dynamo"` — eerste voertuigen met dynamo
- T2: 6V/12V waarschuwing voor vroege modellen
- Düdo: mogelijk > 3.5 ton (rijbewijs C nodig)
- ProMaster: Amerikaanse Ducato met V6 benzine + 120V waarschuwing
- Type H: `roof_type: "corrugated_metal"` — nieuw daktype
- LC70 Troopy: geen bus maar overlander, andere installatie-aanpak

### Geen codewijzigingen nodig
De configurator UI leest dynamisch uit de database — nieuwe voertuigen verschijnen automatisch.

