

## Calculators Hub — Alles op één plek

### Probleem
- 3 tools verspreid over de site: Power Calculator (homepage component), Kabelberekening (`/calculator`), Pakketsimulator (`/build`)
- `/calculator` bevat alleen de kabelberekening
- Pakketsimulator is alleen bereikbaar via de hero CTA
- Geen overzichtelijke plek waar een bezoeker alle tools vindt

### Voorstel

Maak van `/calculator` een **Calculator Hub** met **3 tabs**:

```text
┌─────────────────────────────────────────────────┐
│  TOOLS & CALCULATORS                            │
│  Bereken, plan en bouw jouw ideale setup.        │
│                                                  │
│  ┌──────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │⚡ Power   │ │🔌 Kabel      │ │🛠️ Pakket    │  │
│  │Calculator│ │ Berekening   │ │ Simulator   │  │
│  └──────────┘ └──────────────┘ └─────────────┘  │
│                                                  │
│  [Inhoud van de geselecteerde tab]               │
└─────────────────────────────────────────────────┘
```

- **Tab 1 — Power Calculator**: De bestaande `PowerCalculator` component (nu op homepage), hergebruikt als tab-inhoud
- **Tab 2 — Kabelberekening**: De bestaande kabelcalculator (huidige `/calculator` inhoud)
- **Tab 3 — Pakketsimulator**: De bestaande Build wizard, hergebruikt als tab-inhoud

### Wat blijft
- De Power Calculator op de **homepage** blijft staan — die werkt daar goed als conversiemiddel
- De `/build` route blijft ook bestaan als directe link (voor de hero CTA)

### Wijzigingen

| Bestand | Wat |
|---|---|
| `src/pages/Calculator.tsx` | Omgebouwd naar tab-layout met Radix Tabs. Bevat 3 tabs. Tab 1 importeert `PowerCalculator`, Tab 2 bevat de huidige kabelberekening (geëxtraheerd naar eigen component), Tab 3 importeert de Build wizard |
| `src/components/CableCalculator.tsx` | **Nieuw** — de kabelberekeningslogica uit `Calculator.tsx` verplaatst naar eigen component (zodat het als tab herbruikbaar is) |
| `src/components/PowerCalculator.tsx` | Geen wijzigingen — wordt hergebruikt |
| `src/pages/Build.tsx` | Extractie van de wizard-logica naar `src/components/BuildWizard.tsx`, de pagina zelf importeert dat component (blijft als standalone route werken) |
| `src/components/BuildWizard.tsx` | **Nieuw** — de wizard uit Build.tsx als herbruikbaar component |
| `src/i18n/locales/*.json` | Nieuwe vertaalsleutels voor de tab-labels en hub-titel |
| `src/components/Navbar.tsx` | Nav label "Calculator" → "Tools" (vertaald) |

### Navigatie
- `/calculator` → Calculator Hub (3 tabs, default = Power Calculator)
- `/calculator?tab=cable` → opent direct kabelberekening tab
- `/calculator?tab=build` → opent direct pakketsimulator tab
- `/build` → blijft werken als standalone pagina
- Hero CTA "Stel je pakket samen" → linkt naar `/calculator?tab=build`
- Homepage Power Calculator → blijft op homepage staan

