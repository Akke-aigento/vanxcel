

## Visueel Systeem voor Installatiegids

Dit voegt twee grote visuele onderdelen toe aan de configurator installatiegids: een interactief SVG bedradingsschema en technische illustraties per fase.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `src/components/configurator/WiringDiagram.tsx` | Interactief SVG bovenaanzicht van de bus met componenten, kabels, legenda, tooltips, fase-highlighting |
| `src/components/configurator/PhaseIllustration.tsx` | 7 inline SVG illustraties (Fase 0-6), conditioneel op basis van configurator state |

### Wijzigingen in bestaande bestanden

| Bestand | Wijziging |
|---|---|
| `StepInstallGuide.tsx` | WiringDiagram bovenaan toevoegen (vóór Fase 0), PhaseIllustration per fase toevoegen, Accordion `onValueChange` bijhouden voor fase-highlighting, state doorgeven aan beide componenten |

### WiringDiagram.tsx — Architectuur

**Bus plattegrond (bovenaanzicht SVG):**
- Rechthoek met afgeronde hoeken, cabine links, laadruimte rechts
- Proportie dynamisch: Ducato breder/langer, T6 compacter (op basis van `state.vehicle?.brand`)
- Stippellijn scheidingswand, wielen als halve ellipsen, schuifdeur opening, achterdeuren
- Label: `[Brand] [Model] [Body type]`

**10 componenten als gekleurde `<rect>` blokjes:**
1. Starterbatterij (grijs) — positie uit `state.motorisation?.starter_battery_location`
2. VanXcel Converter (teal #008593, groot) — centraal naast leisure batterij
3. Leisure batterij (groen) — positie uit `topBatteryLocation?.location_id` (under_seat vs rear)
4. ANL zekering (rood vierkant)
5. Batterij schakelaar (rode cirkel)
6. Zekeringkast (donkerrood)
7. Negatieve busbar (donkergrijs balk)
8. Zonnepaneel (geel, gestippeld, op dak) — alleen als `calc.solarWp > 0`
9. Walstroom inlet (blauw) — alleen als 230V verbruikers
10. Aardpunt (aardingssymbool)

**Kabels als gekleurde `<line>`/`<path>` elementen:**
- Rood (#ef4444) = 12V+, lijndikte ∝ mm²
- Donkerblauw (#3b82f6) = 12V-
- Geel (#f59e0b) = solar MC4
- Paars (#a855f7) = 230V AC
- Labels met mm² per kabel

**VanXcel Converter 5 aansluitingen:** dikke rood/zwart → batterij, Anderson → starter, MC4 → solar, AC in → walstroom, AC out → stopcontact

**Interactiviteit:**
- Hover: CSS highlight + tooltip (via Tooltip component) met specs
- Click op component: `onComponentClick(phaseId)` callback die smooth scrollt naar de fase
- Hover op kabel: tooltip "Van → Naar, Xmm²"

**Legenda:** horizontale rij onder het schema met kleur-swatches

**Responsief:** `viewBox` + `overflow-x-auto` wrapper, "Volledig scherm" knop die een Dialog opent op mobile

**Fase-highlighting:** prop `activePhase: string | null` — componenten van die fase krijgen een pulserende glow, rest wordt 40% opacity

**Download knop:** canvas export via `<canvas>` + `drawImage` van de SVG

### PhaseIllustration.tsx — Per fase

Eén component met een `phase` prop die de juiste SVG rendert. Alle illustraties gebruiken:
- Dunne lijnen (1-1.5px stroke) in `currentColor` (dark mode compatible)
- Opvulkleuren: transparant/licht met accent kleuren (groen=batterij, teal=converter, rood=zekeringen, geel=solar)
- Max 680px breed, 300-400px hoog
- Labels in `text-muted-foreground`, 11-12px

**Fase 0 — Voorbereiding:** Bovenaanzicht werkbank met batterij, converter, kabels, gereedschap, checklist-icoon

**Fase 1 — Batterij plaatsen:** Conditioneel op `topBatteryLocation?.location_id`:
- `under_passenger_seat`: zijaanzicht stoel opgetild, batterij eronder, bouten, airbag waarschuwing
- `garage_rear`: dwarsdoorsnede achterkant, batterij op montageplaat

**Fase 2 — Zekeringkast:** Vooraanzicht 12-slot fuse box met gelabelde circuits, gekleurde zekeringen, busbar

**Fase 3 — Kabels trekken:** Langsdoorsnede bus met stippellijnen voor kabelroutes, doorvoerpunten, waarschuwingsdriehoeken

**Fase 4 — VanXcel aansluiten:** Converter van bovenaf met alle aansluitpunten gelabeld, volgorde-nummers ①②③④⑤⑥

**Fase 5 — Testen:** Multimeter met probes op busbar, display "12.8V", vinkje/kruisje

**Fase 6 — Afwerken:** Camera icoon, document icoon, gelabelde zekeringkast, gereedschapskist

### Plaatsing in StepInstallGuide.tsx

```text
┌─────────────────────────────┐
│ JOUW BEDRADINGSSCHEMA       │  ← WiringDiagram (nieuw)
│ [Interactieve SVG plattegrond] │
│ [Legenda] [Download knop]   │
├─────────────────────────────┤
│ ▼ Fase 0: Voorbereiding     │
│   [PhaseIllustration phase=0]│  ← Illustratie bovenaan
│   1. Stap...                │
│   2. Stap...                │
├─────────────────────────────┤
│ ▼ Fase 1: Batterij plaatsen │
│   [PhaseIllustration phase=1]│
│   ...                       │
└─────────────────────────────┘
```

### Accordion state tracking

`StepInstallGuide` krijgt een `openPhases` state die wordt doorgegeven aan `WiringDiagram` als `activePhase` voor highlighting. Bij klik op een component in het diagram wordt de bijbehorende fase geopend en erheen gescrolled.

### Omvang

Dit is een groot visueel component (~800-1000 regels voor WiringDiagram, ~400-500 voor PhaseIllustration). De SVGs zijn handmatig gecodeerd in JSX — geen externe afbeeldingen nodig.

