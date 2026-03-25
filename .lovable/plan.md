

## Vijfde Golf Voertuigen Seeden

### Overzicht
12 nieuwe voertuigen toevoegen — eindtotaal 54 voertuigen, 22+ merken.

### Insert operatie over 5 tabellen

| Tabel | Nieuwe rijen |
|---|---|
| `vehicles` | 12 |
| `vehicle_body_types` | ~15 (HiAce H200 2, Caravan 1, L300 1, HiJet 1, T6.1 kopie T6, Scudo kopie Trafic, Vario 1, Sambar 1, Estafette 1, Bedford 1, Mercedes T1 1, Rodius 1) |
| `vehicle_motorisations` | ~15 (HiAce H200 2, Caravan 1, L300 1, HiJet 1, T6.1 kopie T6, Scudo 1, Vario 1, Sambar 1, Estafette 1, Bedford 1, Mercedes T1 1, Rodius 1) |
| `vehicle_warnings` | ~14 |
| `vehicle_popular_configs` | ~12 |

**Totaal: ~68 rijen**

### Bijzonderheden
- T6.1: kopieert T6 body types + motorisaties (aangepaste jaargangen)
- Scudo: kopieert Trafic body types, eigen motorisatie (2.0 BlueHDi 145pk)
- Vario: mogelijke 24V systemen — kritieke waarschuwing
- Estafette: `alternator_type: "dynamo"` — net als T1 en Type H
- HiJet + Sambar: kei-voertuigen, kleinste alternators (45-50A)
- Rodius: de "lelijkste bus ter wereld" met tongue-in-cheek waarschuwingen

### Afhankelijkheden
- T6 en Trafic moeten bestaan voor kopieer-acties (bevestigd in eerdere golven)
- Geen codewijzigingen nodig — UI leest dynamisch uit database

