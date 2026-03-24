

## Configurator toevoegen aan Tools dropdown in Navbar

### Wijziging

In `src/components/Navbar.tsx`: voeg een extra item toe aan de `toolItems` array voor de Configurator, met een "Coming Soon" badge. Zowel in het desktop dropdown menu als in het mobile expandable menu.

### Aanpak

1. Voeg een nieuw item toe aan `toolItems` met een `comingSoon: true` vlag
2. Render dit item met een "Coming Soon" badge (kleine pill) en maak de link klikbaar naar `/configurator` (of disabled, afhankelijk van voorkeur)
3. Styling: gedempte tekst + klein accent badge "Coming Soon"

### Bestand

| Bestand | Actie |
|---|---|
| `src/components/Navbar.tsx` | Item toevoegen aan toolItems + badge rendering |

