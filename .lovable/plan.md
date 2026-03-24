

## Configurator Stap 1: Voertuig Selectie

### Overzicht
Een nieuwe pagina `/configurator` met een multi-stap voertuigselectie wizard (6 sub-stappen) die data uit Supabase haalt. De bestaande `/build` pagina (package generator) blijft apart bestaan.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `src/pages/Configurator.tsx` | Pagina wrapper met Navbar, titel, Footer |
| `src/components/configurator/ConfiguratorWizard.tsx` | Hoofd wizard container met state management, stap-logica, samenvattingsbalk |
| `src/components/configurator/StepBrandSelect.tsx` | Sub-stap 1a: merk selectie grid |
| `src/components/configurator/StepModelSelect.tsx` | Sub-stap 1b: model/generatie kaarten |
| `src/components/configurator/StepBodyTypeSelect.tsx` | Sub-stap 1c: carrosserie kaarten met specs |
| `src/components/configurator/StepBuildYear.tsx` | Sub-stap 1d: bouwjaar slider/input |
| `src/components/configurator/StepMotorisationSelect.tsx` | Sub-stap 1e: motorisatie kaarten met alternator badges |
| `src/components/configurator/StepWarnings.tsx` | Sub-stap 1f: waarschuwing banners |
| `src/components/configurator/VehicleSummaryBar.tsx` | Compacte samenvatting van gemaakte keuzes bovenaan |
| `src/hooks/use-configurator.ts` | Custom hook: Supabase queries (useQuery) voor vehicles, body types, motorisations, warnings |

### Bestaande bestanden aanpassen

| Bestand | Wijziging |
|---|---|
| `src/App.tsx` | Route `/configurator` toevoegen |
| `src/i18n/locales/nl.json` | `configurator.*` keys toevoegen |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

### State management

De `ConfiguratorWizard` houdt alle state bij in een enkel object:

```typescript
interface ConfiguratorState {
  brand: string | null;
  vehicleId: string | null;
  bodyTypeId: string | null;
  buildYear: number | null;
  motorisationId: string | null;
  subStep: number; // 0-5
}
```

### Data hooks (`use-configurator.ts`)

- `useVehicleBrands()` — distinct brands uit vehicles, gesorteerd op popularity_rank
- `useVehiclesByBrand(brand)` — vehicles voor geselecteerd merk
- `useBodyTypes(vehicleId)` — body types voor voertuig
- `useMotorisations(vehicleId, buildYear)` — motorisaties gefilterd op bouwjaar range
- `useVehicleWarnings(vehicleId, buildYear, engineCode)` — relevante waarschuwingen

### UI per sub-stap

**1a Merk**: 2-3 kolom grid, grote kaarten met merknaam + aantal modellen. RevealOnScroll.

**1b Model**: Kaarten met model, generatie_label, productiejaren. Platform-shared info als subtekst.

**1c Carrosserie**: Kaarten met code+label, afmetingen grid (L×B×H intern), volume, payload, geschiktheid-badge (groen/geel/rood). "Aanbevolen" badge op beste optie.

**1d Bouwjaar**: Slider component met min/max uit voertuig data. Toont gekozen jaar groot.

**1e Motorisatie**: Kaarten met engine family, pk, emissienorm badge, alternator type badge (groen=conventioneel, rood=smart). Alternator amps range.

**1f Waarschuwingen**: Alert banners (rood/oranje/blauw per severity). Altijd zichtbaar. Smart alternator = prominente banner met DC-DC uitleg. "Volgende stap" button onderaan.

### Samenvatting balk
Bovenaan de wizard, groeit mee naarmate keuzes worden gemaakt:
`"Fiat Ducato X290 · L2H2 · 2019 · 2.3 MultiJet II 150pk · Smart alternator"`

### Animaties
- Elke sub-stap slide-in met `animate-fade-in-up`
- Terug-pijl bovenaan per sub-stap
- Selectie = accent border + check icon (zelfde stijl als BuildWizard)

