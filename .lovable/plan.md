

## Responsive marquee snelheid

Huidige situatie: marquee draait op `40s` op alle schermformaten.

### Aanpassing in `src/index.css`

Voeg media queries toe voor de marquee-snelheid:
- **Desktop** (standaard): `40s` — blijft hetzelfde
- **Tablet** (`max-width: 1024px`): `28s` — merkbaar sneller
- **Mobiel** (`max-width: 768px`): `20s` — nog sneller

De `.marquee-track` class krijgt responsive `animation-duration` via `@media` queries.

### Alleen dit bestand wordt aangepast:
- `src/index.css`

