

## Website WOW-factor: next-level animaties

### Huidige staat
De site heeft basis fade-in scroll reveals — netjes maar braaf. Geen movement, geen diepte, geen "wow". Tijd voor tastbare dynamiek.

### Wat er verandert

#### 1. Hero — Parallax + Ken Burns effect
**`src/components/HeroSection.tsx`**
- **Achtergrond slow-zoom**: de hero-afbeelding krijgt een constante langzame zoom (Ken Burns) via CSS `@keyframes scale 1→1.08` over 20s — geeft leven aan het eerste scherm
- **Parallax scroll**: bij scrollen beweegt de achtergrond trager dan de content via `transform: translateY(scrollY * 0.3)` met een lightweight scroll listener
- **Staggered tekst-animatie**: elke regel van de hero tekst schuift iets later in (al aanwezig maar kan dramatischer — grotere translateY, snappier timing)

#### 2. Sectie-titels — Animated underline accent
**`src/index.css`** + diverse componenten
- Na het reveal van een sectie-titel verschijnt een geanimeerde accent-lijn (2px primary kleur) die van links naar rechts groeit onder de titel — geeft focus en richting

#### 3. Category & Product Cards — 3D tilt hover
**`src/components/ProductCard.tsx`** + **`src/components/CategoryGrid.tsx`**
- Cards krijgen een subtiel 3D perspectief-effect bij hover: `perspective(800px) rotateY(±3deg) rotateX(±2deg)` gebaseerd op muispositie
- Combineer met de bestaande scale en shadow — voelt als een fysieke kaart die je optilt
- Implementatie via een kleine `onMouseMove` handler die CSS custom properties `--rx` en `--ry` set

#### 4. Floating particles / glow achtergrond
**`src/components/HeroSection.tsx`**
- Voeg 3-4 subtiele radial gradient "glow orbs" toe die langzaam driften (CSS animation, geen JS) — geeft diepte aan de hero zonder afleidend te zijn
- Kleuren: primary (teal) en accent (amber) op zeer lage opacity (0.05-0.1)

#### 5. Counter animatie — TrustBar & ComparisonTable
**`src/hooks/use-count-up.ts`** (nieuw)
- Getallen in de comparison table animeren omhoog wanneer ze in viewport komen (bv "3.000 – 5.000+" telt op van 0)
- Simpele hook: `useCountUp(target, duration)` die een easeOut interpolatie doet

#### 6. CTA buttons — Shimmer effect
**`src/index.css`**
- De amber CTA buttons krijgen een subtiel shimmer/glans effect: een diagonale lichtstreep die eenmalig over de button glijdt bij hover
- Pure CSS met `background: linear-gradient` en `background-position` animatie

#### 7. Scroll-indicator in Hero
**`src/components/HeroSection.tsx`**
- Een subtiel bouncend chevron/pijltje onderaan de hero dat aangeeft "scroll naar beneden"
- Verdwijnt zodra je begint te scrollen (opacity transition)

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/HeroSection.tsx` | Ken Burns zoom, parallax, glow orbs, scroll indicator |
| `src/components/ProductCard.tsx` | 3D tilt hover effect |
| `src/components/CategoryGrid.tsx` | 3D tilt op category cards |
| `src/components/ComparisonTable.tsx` | Count-up animatie op getallen |
| `src/hooks/use-count-up.ts` | Nieuw — count-up animatie hook |
| `src/index.css` | Shimmer buttons, animated underlines, Ken Burns keyframes, glow orbs, scroll indicator bounce |

### Geen impact op
- Performance: alles is CSS-driven of lightweight JS (geen externe libraries)
- Functionaliteit: puur visueel
- Mobiel: parallax en tilt worden uitgeschakeld op touch devices (respecteer `prefers-reduced-motion` en touch detection)

