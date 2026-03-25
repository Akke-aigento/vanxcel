

## Voertuigen Seeden in Configurator Database

### Overzicht
8 nieuwe voertuigen toevoegen (Sprinter, Transit Custom, Trafic, Jumper, Boxer, Vivaro, Vito, Crafter) met hun body types, motorisaties, waarschuwingen en populaire configs. Ducato en T6 bestaan al.

### Aanpak

**Stap 1: Insert 8 vehicles** — elk met hun eigen brand/model/generation data en popularity_rank 3-10.

**Stap 2: Insert body types** per voertuig:
- Sprinter: 4 body types (L2H2, L3H2, L3H3, L4H3)
- Transit Custom: 3 (L1H1, L2H1, L2H2)
- Trafic: 2 (L1H1, L2H1)
- Jumper: 5 (kopieer Ducato afmetingen, aangepaste notes)
- Boxer: 5 (kopieer Ducato/Jumper)
- Vivaro: 2 (kopieer Trafic)
- Vito: 2 (L2H1, L3H1)
- Crafter: 4 (kopieer Sprinter)

**Stap 3: Insert motorisaties** per voertuig:
- Sprinter: 3 (OM654 varianten)
- Transit Custom: 3 (EcoBlue + TDCi)
- Trafic: 2 (1.6 dCi + 2.0 Blue dCi)
- Jumper: 2 (PSA BlueHDi)
- Boxer: 2 (kopieer Jumper)
- Vivaro: 1 (2.0 Turbo D)
- Vito: 1 (OM654 136pk)
- Crafter: 1 (2.0 TDI)

**Stap 4: Insert waarschuwingen** per voertuig (2-3 per voertuig)

**Stap 5: Insert populaire configs** per voertuig (1-2 per voertuig, platformgenoten kopiëren van hun basis)

### Technische details

Alle inserts via de Supabase insert tool. De `affected_years` arrays worden als Postgres arrays geformateerd. Voertuig IDs worden eerst geinsert en dan gebruikt als foreign keys voor de subtabellen. Totaal ~75 rijen over 5 tabellen.

### Geen codewijzigingen nodig
De configurator UI leest dynamisch uit de database — nieuwe voertuigen verschijnen automatisch.

