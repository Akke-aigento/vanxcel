

## Mobiele verbeteringen: Hero, Categorieën & TrustBar

### 1. Hero hoger op mobiel
**`src/components/HeroSection.tsx`**
- Verander `h-[75vh]` naar `h-[85vh] md:h-[75vh]` — op mobiel wordt de banner iets hoger, op desktop blijft het 75vh.

### 2. Categorieën beperkt tot 3 op mobiel + CTA knop
**`src/components/CategoryGrid.tsx`**
- Op mobiel (`< md`): toon alleen de eerste 3 categorieën
- Voeg daaronder een "Alle categorieën" knop toe die linkt naar `/shop`
- Op desktop: alles blijft zoals het is
- Vertaalsleutel toevoegen: `categories.viewAll` in alle 4 locale bestanden

### 3. TrustBar uitlijning fixen op mobiel
**`src/components/TrustBar.tsx`**
- Huidige layout: `grid-cols-2` met `items-center justify-center` — op mobiel worden de items niet goed uitgelijnd omdat de tekst varieert in lengte
- Fix: op mobiel (`grid-cols-2`) gebruik `items-start` ipv `items-center justify-center`, en voeg `text-left` toe zodat alles links uitgelijnd is per cel
- Op desktop (`md:grid-cols-4`) behoud gecentreerde layout

### Bestanden die worden aangepast
1. `src/components/HeroSection.tsx` — hoogte responsive
2. `src/components/CategoryGrid.tsx` — max 3 + CTA op mobiel
3. `src/components/TrustBar.tsx` — uitlijning fix
4. `src/i18n/locales/{nl,en,fr,de}.json` — nieuwe vertaalsleutel `categories.viewAll`

