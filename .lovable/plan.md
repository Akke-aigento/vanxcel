

## Website dynamischer en geanimeerder maken

### Aanpak
Scroll-gebaseerde reveal-animaties toevoegen aan alle secties op de homepage, plus subtiele hover- en interactie-animaties — professioneel, niet kitscherig.

### 1. Herbruikbare `useScrollReveal` hook (nieuw)
**`src/hooks/use-scroll-reveal.ts`**
- Custom hook gebaseerd op `IntersectionObserver`
- Retourneert een `ref` en `isVisible` boolean
- Configurable threshold (default 0.15) en `once` option (default true)
- Elementen animeren pas in wanneer ze in viewport komen

### 2. Herbruikbaar `RevealOnScroll` wrapper component (nieuw)
**`src/components/RevealOnScroll.tsx`**
- Wrapper component dat `useScrollReveal` gebruikt
- Props: `direction` (`up` | `left` | `right` | `fade`), `delay` (ms), `className`
- Transition: `opacity 0 → 1` + `translateY/X` afhankelijk van richting
- CSS transition (geen keyframe) voor smooth 60fps animatie
- `duration-700 ease-out`

### 3. Animaties per sectie toepassen

| Component | Animatie |
|---|---|
| **TrustBar** | Elke USP-item fade-in met staggered delay (0ms, 100ms, 200ms, 300ms) |
| **CategoryGrid** | Titel fade-up, elke categorie-card fade-up met staggered delay per kaart |
| **FeaturedProducts** | Titel fade-up, product cards fade-up staggered |
| **PowerCalculator** | Hele sectie fade-up |
| **ReviewsMarquee** | Fade-in wanneer in viewport |
| **ComparisonTable** | Titel fade-up, tabel fade-up met lichte delay |
| **Newsletter** | Fade-up als geheel |

### 4. Extra micro-animaties in CSS
**`src/index.css`**
- Navbar: `transition-all duration-300` bij scroll — achtergrond wordt iets meer opaque bij scrollen (optioneel: kleiner worden)
- CTA buttons op hover: subtiele `scale(1.02)` + `shadow-lg` transition
- Product cards: hover shadow glow effect met `shadow-primary/10`
- Category cards: soepelere hover border-glow

### 5. Navbar scroll-effect (optioneel enhancement)
**`src/components/Navbar.tsx`**
- Detecteer scroll positie (`window.scrollY > 20`)
- Bij scrollen: navbar krijgt sterkere `bg-background/95` + `shadow-md` voor een "sticky header condenseert" effect

### Bestanden

| Bestand | Actie |
|---|---|
| `src/hooks/use-scroll-reveal.ts` | Nieuw — IntersectionObserver hook |
| `src/components/RevealOnScroll.tsx` | Nieuw — animatie wrapper |
| `src/components/TrustBar.tsx` | Wrap items in RevealOnScroll |
| `src/components/CategoryGrid.tsx` | Wrap titel + cards in RevealOnScroll |
| `src/components/FeaturedProducts.tsx` | Wrap titel + cards in RevealOnScroll |
| `src/components/PowerCalculator.tsx` | Wrap sectie in RevealOnScroll |
| `src/components/ComparisonTable.tsx` | Wrap titel + tabel in RevealOnScroll |
| `src/components/Newsletter.tsx` | Wrap in RevealOnScroll |
| `src/components/Navbar.tsx` | Scroll-based opacity/shadow effect |
| `src/index.css` | Hover micro-animaties voor buttons en cards |

### Geen impact op
- Functionaliteit — puur visueel
- Performance — IntersectionObserver is native en lightweight
- Bestaande animaties (hero, marquee) — die blijven ongewijzigd

