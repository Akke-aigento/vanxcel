

## Configurator "Coming Soon" blokkeren

### Probleem
Het configurator menu-item toont een "Soon" badge maar linkt gewoon naar `/configurator`, waardoor gebruikers er toch in kunnen.

### Aanpak

In `src/components/Navbar.tsx`: als `item.comingSoon` is `true`, render een `<span>` of `<div>` in plaats van een `<Link>`. Maak het item visueel gedimpt (`opacity-50 cursor-not-allowed`) en toon een toast "Coming soon!" bij klik. Dit geldt voor zowel de desktop dropdown als het mobile menu.

### Bestand

| Bestand | Wijziging |
|---|---|
| `src/components/Navbar.tsx` | Vervang `<Link>` door niet-navigerend element voor `comingSoon` items (desktop + mobile) |

