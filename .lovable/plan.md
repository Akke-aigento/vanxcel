

## Bestsellers dynamisch laden uit "bestellers" collectie

### Wat er verandert

De `FeaturedProducts` component haalt nu alle producten op (`per_page: 6` zonder filter). Dit wordt aangepast zodat alleen producten uit de "bestellers" collectie worden getoond.

### Aanpassing in `src/components/FeaturedProducts.tsx`

- Wijzig de `useProducts` call van `{ per_page: 6 }` naar `{ collection: 'bestellers', per_page: 6 }`
- Verwijder de `is_featured` filter/sorteer logica — de API levert nu al de juiste producten
- De rest (UI, animaties, skeleton) blijft identisch

Dit is een eenregelige wijziging: de `collection` parameter wordt meegegeven aan de bestaande `useProducts` hook, die dit al doorgeeft als query parameter aan de SellQo API.

### Alleen dit bestand wordt aangepast:
- `src/components/FeaturedProducts.tsx`

