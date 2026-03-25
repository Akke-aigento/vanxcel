

## Vierde Golf Voertuigen Seeden

### Overzicht
14 nieuwe voertuigen toevoegen — totaal 42 voertuigen na deze seed.

### Insert operatie over 5 tabellen

| Tabel | Nieuwe rijen |
|---|---|
| `vehicles` | 14 |
| `vehicle_body_types` | ~16 (Berlingo 2, Kangoo 1, Caddy 2, Partner 2, Combo 2, ProAce City 2, Bongo 1, Talbot 1, LiteAce 1, UAZ 1, LDV 1, Hyundai 1, NV200 1, Transit MK2 1) |
| `vehicle_motorisations` | ~16 (Berlingo 1, Kangoo 1, Caddy 1, Partner 1, Combo 1, ProAce City 1, Bongo 2, Talbot 1, LiteAce 1, UAZ 1, LDV 1, Hyundai 1, NV200 2 incl. EV, Transit MK2 1) |
| `vehicle_warnings` | ~18 |
| `vehicle_popular_configs` | ~14 |

**Totaal: ~78 rijen**

### Bijzonderheden
- Berlingo platform: 4 platformgenoten (Partner, Combo, ProAce City) kopiëren body types + motorisatie
- e-NV200: `alternator_type: "none"`, `fuel_type: "electric"` — eerste volledig elektrisch voertuig
- Bongo: `roof_type: "pop_top_electric"` — nieuw daktype
- UAZ Bukhanka: in productie sinds 1965, geen elektronica
- Talbot Express: `brand: "Talbot/Fiat"` — dubbel merk

### Geen codewijzigingen nodig
De configurator UI leest dynamisch uit de database.

