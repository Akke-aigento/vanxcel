

## Tweede Golf Voertuigen Seeden

### Overzicht
8 nieuwe voertuigen toevoegen (Renault Master, Ford Transit V363, Toyota ProAce, MAN TGE, VW T5, VW T4, VW T3, VW T7 Multivan) — totaal 18 voertuigen na deze seed.

### Aanpak

**Eén grote database insert operatie** over 5 tabellen:

| Tabel | Nieuwe rijen |
|---|---|
| `vehicles` | 8 |
| `vehicle_body_types` | ~19 (Master 3, Transit 4, ProAce 2, TGE 4, T5 2, T4 2, T3 1, T7 1) |
| `vehicle_motorisations` | ~16 (Master 2, Transit 2, ProAce 1, TGE 1, T5 3, T4 2, T3 2, T7 2 incl. PHEV) |
| `vehicle_warnings` | ~20 (2-3 per voertuig) |
| `vehicle_popular_configs` | ~10 (1-2 per voertuig, platformgenoten kopiëren) |

**Totaal: ~73 rijen**

### Bijzonderheden
- T3, T4, vroege T5: **conventionele alternators** (eerste voertuigen zonder smart alternator)
- T7 eHybrid: **PHEV zonder traditionele alternator** — speciale waarschuwingen
- MAN TGE: kopieert Crafter/Sprinter specs
- Affected years als Postgres integer arrays

### Geen codewijzigingen nodig
De configurator UI leest dynamisch uit de database.

