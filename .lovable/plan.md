## Problemen
1. **Logo overlapt navbar**: in de hero staat een tweede VanXcel-logo dat op mobiel deels onder de fixed navbar verdwijnt (navbar bevat al hetzelfde logo → dubbel + visueel afgeknipt).
2. **Subtitle onleesbaar**: `text-primary` (teal) op de oranje/amberkleurige lucht heeft te weinig contrast.

## Aanpassingen in `src/components/HeroSection.tsx`

1. **Logo in hero verwijderen** (regels 53-57). Navbar toont het logo al; de hero leunt op de grote "POWER YOUR JOURNEY" typografie. Schoner en geen overlap meer met de banner.

2. **Subtitle leesbaarder maken** (regel 62):
   - `text-primary` → `text-foreground/90` (warm wit) met een subtiele `drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]` voor leesbaarheid op de oranje lucht.
   - Past binnen het bestaande designsysteem (geen hardgecodeerde kleuren); blijft consistent met de witte H1 erboven.

## Niet gewijzigd
- Geen wijzigingen aan navbar, CTA's, hero-image of desktop layout (logo verwijderen geldt voor alle viewports — desktop wint óók aan rust, maar geef gerust seintje als je het op desktop wél wil houden).