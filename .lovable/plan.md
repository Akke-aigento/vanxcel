

## Homepage Opschonen

### 3 wijzigingen:

**1. Bestsellers verwijderen uit CategoryGrid** (`CategoryGrid.tsx`)
Filter de `bestsellers` collectie uit het resultaat. Voeg `.filter(c => c.slug !== 'bestsellers')` toe aan de collections memo.

**2. SEO-tekst onder PowerCalculator verwijderen** (`PowerCalculator.tsx`)
Verwijder het hele `{/* SEO Content */}` blok (regels 124-149) — de drie RevealOnScroll secties met powerSeo teksten.

**3. Geen andere wijzigingen**
Carousel wordt niet geïmplementeerd (grid is beter voor conversie). De `bestsellers` slug in `categoryImages` kan ook opgeschoond worden maar is niet nodig (wordt gewoon niet meer getoond).

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/CategoryGrid.tsx` | Filter `bestsellers` slug uit collections |
| `src/components/PowerCalculator.tsx` | Verwijder SEO content blok (regels 124-149) |

