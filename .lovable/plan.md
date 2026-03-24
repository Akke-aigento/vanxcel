

## Nog meer WOW-factor — next level

### Wat er al is
Ken Burns hero, parallax, 3D tilt cards, count-up counters, shimmer buttons, scroll reveals, glow orbs. Dat is een stevige basis. Hier zijn de volgende stappen die het verschil maken:

### Nieuwe effecten

#### 1. Smooth page transitions (fade between routes)
Wanneer je tussen pagina's navigeert, fade de oude pagina uit en de nieuwe in — geeft een app-achtig gevoel ipv een harde page swap. Implementatie via een `AnimatedOutlet` wrapper met CSS opacity transition rond React Router's `<Outlet>`.

#### 2. Magnetic cursor op CTA buttons (desktop)
De grote CTA buttons (hero, newsletter) "trekken" licht naar je muis toe wanneer je in de buurt komt — subtiel (max 6px verschuiving), voelt magnetisch en premium. Pure JS `onMouseMove` op de button parent.

#### 3. Staggered product grid — wave-in effect
In de Shop pagina en Featured Products laden de product cards niet allemaal tegelijk maar in een golf-patroon: elke card verschijnt 50ms na de vorige, van links naar rechts per rij. Geeft een "cascade" effect.

#### 4. Tekst split-reveal op sectietitels
Grote titels (CategoryGrid, FeaturedProducts, ComparisonTable) worden letter-voor-letter of woord-voor-woord onthuld met een stagger — elke letter/woord schuift iets later in. Veel impactvoller dan een hele titel die tegelijk fade-in doet.

#### 5. Navbar logo morph bij scroll
Het navbar-logo wordt subtiel kleiner (scale 1 → 0.85) en krijgt een glow-effect wanneer je naar beneden scrollt — laat zien dat de nav "leeft".

#### 6. Product image hover zoom-pan
Op de Shop en ProductDetail pagina: bij hover over een product-afbeelding volgt de zoom de muispositie — alsof je inzoomt op het deel waar je muis staat. Geeft een premium e-commerce gevoel.

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/AnimatedOutlet.tsx` | Nieuw — route transition wrapper |
| `src/App.tsx` | AnimatedOutlet integreren |
| `src/components/MagneticButton.tsx` | Nieuw — magnetic hover wrapper |
| `src/components/HeroSection.tsx` | MagneticButton op CTA's |
| `src/components/SplitRevealText.tsx` | Nieuw — woord-voor-woord reveal |
| `src/components/CategoryGrid.tsx` | SplitRevealText op titel |
| `src/components/FeaturedProducts.tsx` | SplitRevealText op titel + staggered wave op cards |
| `src/components/ProductCard.tsx` | Image zoom-pan op hover |
| `src/pages/Shop.tsx` | Staggered grid animatie |
| `src/components/Navbar.tsx` | Logo scale + glow bij scroll |
| `src/components/Newsletter.tsx` | MagneticButton op CTA |
| `src/index.css` | Page transition CSS, zoom-pan styles |

### Geen impact op
- Performance: alles native CSS/JS, geen libraries
- Mobiel: magnetic cursor en zoom-pan disabled op touch
- `prefers-reduced-motion`: alle nieuwe animaties respecteren dit

