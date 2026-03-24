

## SEO-content toevoegen onder PowerCalculator en BuildWizard

### Probleem
De CableCalculator heeft uitgebreide uitleg-content eronder (hoe het werkt, waarom kabeldikte belangrijk is, tips). De PowerCalculator en BuildWizard eindigen abrupt na de tool zelf — geen uitleg, geen SEO-content.

### Aanpak
Dezelfde stijl als de CableCalculator: onder elke tool een sectie met 2-3 informatieve blokken (H2 + paragraaf), wrapped in RevealOnScroll.

### 1. PowerCalculator — SEO-content toevoegen
**`src/components/PowerCalculator.tsx`**

Na het resultaat-blok, voeg een sectie toe met:
- **"Hoe werkt de leistungsrechner?"** — uitleg over Wh berekening en batterijcapaciteit
- **"LiFePO4 vs AGM — hoeveel capaciteit heb je echt nodig?"** — uitleg over bruikbare capaciteit (80% vs 50%)
- **"Tips voor je energiehuishouding"** — 3 praktische tips (zuinige apparaten, solar, etc.)

### 2. BuildWizard — SEO-content toevoegen
**`src/components/BuildWizard.tsx`**

Na de navigatie-buttons, voeg een sectie toe met:
- **"Hoe kies je het juiste off-grid pakket?"** — uitleg over de factoren (gebruik, solar, batterij)
- **"Wat zit er in een compleet campervan energiesysteem?"** — opsomming componenten (batterij, omvormer, kabels, zekering)
- **"Veelgestelde vragen"** — 2-3 korte FAQ's

### 3. i18n keys toevoegen
Nieuwe keys in `powerCalc` en `buildWizard` secties voor alle 4 talen (nl, en, fr, de).

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/PowerCalculator.tsx` | SEO-content sectie toevoegen na resultaat |
| `src/components/BuildWizard.tsx` | SEO-content sectie toevoegen na wizard |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

