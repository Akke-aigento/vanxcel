

## Kritieke Veiligheidsupdate Configurator

### Overzicht
6 veiligheidsverbeteringen: conservatievere DC-DC sizing, omvormer-kabel op piekstroom, extra producten in pakket, zekeringenkolom in bekabelingstabel, 4 veiligheidswaarschuwingen bovenaan installatiegids, en een disclaimer onderaan.

### 1. DC-DC conservatiever (`configurator-calculations.ts`)

Wijzig `calculateDcDc`: alle alternators → 25% (was 30/40%), charge rate → 0.2C (was 0.25C).

### 2. Omvormer-kabel op piekstroom (`StepInstallGuide.tsx`)

De `battery_to_inverter` rij berekent amps nu als `inverterW / 12`. Wijzig naar: `Math.ceil(inverterW / 12 * 1.25)` (piekstroom + 25% marge). Voeg max 1.5m lengte-advies toe als extra tekst onder de omvormer-rij.

### 3. Extra producten in pakket (`configurator-package.ts`)

Na de bestaande items, voeg toe:

| Item | Conditie | Prijs |
|---|---|---|
| ANL Fuse + holder | Altijd | €15-18 (op basis van kabeldikte) |
| Battery Disconnect Switch | Altijd | €25 |
| Negatieve Busbar 6-weg | Altijd | €15 |

Sizing ANL fuse: 150A bij 25mm², 200A bij 35mm², 300A bij 50mm² (gebaseerd op hoofd-kabeldikte, afgeleid van batterij→omvormer of batterij→fusebox).

### 4. Zekeringenkolom in bekabelingstabel (`StepInstallGuide.tsx`)

Extra `<TableHead>` kolom "Zekering" met per circuit:

| Circuit | Zekering |
|---|---|
| starter_to_dcdc | MIDI fuse, 125% van dcDcA |
| dcdc_to_leisure | MIDI fuse, 125% van dcDcA |
| solar_to_mppt | — |
| mppt_to_battery | — |
| battery_to_fusebox | ANL fuse (zelfde als in pakket) |
| battery_to_inverter | ANL fuse (op basis van inverterW) |

### 5. Veiligheidswaarschuwingen bovenaan installatiegids (`StepInstallGuide.tsx`)

4 hardcoded banners BOVEN de voertuig-specifieke waarschuwingen:

1. **ROOD** (altijd): Zekering binnen 18cm van batterij
2. **ROOD** (alleen als inverterW > 0): 230V waarschuwing + RCD/aardlekschakelaar
3. **ORANJE** (altijd): LiFePO4 & vorst
4. **ORANJE** (altijd): Kabelkwaliteit + crimpen

### 6. Disclaimer onderaan installatiegids (`StepInstallGuide.tsx`)

Na de tips-sectie: een disclaimer card met aansprakelijkheidsbeperking.

### i18n keys (alle 4 talen)

Nieuwe keys voor:
- 4 veiligheidsbanner-titels + beschrijvingen
- Disclaimer tekst
- Zekering kolom label + per-circuit zekering beschrijvingen
- Omvormer kabel max lengte advies
- ANL fuse, disconnect switch, busbar namen/reasons

### Bestanden

| Bestand | Actie |
|---|---|
| `src/lib/configurator-calculations.ts` | DC-DC conservatiever (0.25 alt, 0.2C) |
| `src/lib/configurator-package.ts` | 3 nieuwe items: ANL fuse, disconnect switch, busbar |
| `src/components/configurator/StepInstallGuide.tsx` | Veiligheidswaarschuwingen, zekeringenkolom, omvormer piekstroom, disclaimer |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

