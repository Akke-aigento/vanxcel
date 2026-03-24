

## Campervan Configurator — Database Setup

### Overzicht
10 tabellen aanmaken met RLS policies, plus seed data voor 2 voertuigen (Fiat Ducato X290, VW Transporter T6) en 20 universele apparaten.

### Database migraties

**Migratie 1: Schema (alle 10 tabellen)**

| Tabel | Rijen seed data |
|---|---|
| `vehicles` | 2 (Ducato, T6) |
| `vehicle_body_types` | 8 (5 Ducato + 3 T6) |
| `vehicle_motorisations` | 8 (5 Ducato + 3 T6) |
| `vehicle_battery_locations` | 3 (Ducato) |
| `vehicle_cable_routes` | 3 (Ducato) |
| `vehicle_grounding_points` | 2 (Ducato) |
| `vehicle_warnings` | 6 (3 Ducato + 3 T6) |
| `vehicle_popular_configs` | 7 (4 Ducato + 3 T6) |
| `appliances` | 20 (universeel) |
| `configurator_sessions` | 0 (runtime tabel) |

Alle tabellen krijgen:
- `id uuid primary key default gen_random_uuid()`
- RLS enabled
- Public read policy (`FOR SELECT USING (true)`)
- `configurator_sessions` krijgt ook INSERT/UPDATE policies met `WITH CHECK (true)` / `USING (true)`
- Unique constraints zoals gespecificeerd

**Migratie 2: Seed data**
- Alle INSERT statements voor de 2 voertuigen + gerelateerde data + 20 appliances
- Data exact zoals opgegeven door de gebruiker

### Geen frontend wijzigingen
Puur database — geen componenten, geen routes, geen i18n.

### Bestanden
Geen codebestanden worden aangeraakt. Alleen 2 database migraties via de migration tool.

