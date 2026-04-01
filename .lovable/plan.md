

## Fix: Productkaarten reageren slecht op klikken/tikken

### Root cause

Twee problemen werken samen:

1. **3D tilt-effect op de `<Link>`**: De `onMouseMove` handler past continu CSS custom properties (`--rx`, `--ry`) aan op het `<Link>` element zelf. Dit triggert `transform`-transities (0.15s) die op touchscreens interfereren met tap-events — de browser interpreteert de beweging als een drag i.p.v. een klik.

2. **Geneste `onMouseMove` op de image-wrapper**: Een tweede `onMouseMove` handler op de binnenste `<div>` verandert `transformOrigin` op de afbeelding. Dit extra event-handling op een child van de `<Link>` maakt het klikgedrag nog onbetrouwbaarder.

3. **CSS `transition: transform 0.15s`** op `.card-3d-tilt-inner`: elke transform-wijziging genereert transitionEnd events die bubbelen en potentieel de AnimatedOutlet verwarren.

### Oplossing

**Bestand: `src/components/ProductCard.tsx`**

- Verwijder de `onMouseMove` en `onMouseLeave` handlers van de `<Link>` (de tilt-berekening)
- Verwijder de `onMouseMove` en `onMouseLeave` handlers van de image-wrapper div (de zoom-origin berekening)
- Verwijder de `ref={cardRef}` en de `cardRef` variabele
- Verwijder de `handleMouseMove` en `handleMouseLeave` functies
- Houd `handleMouseEnter` (prefetch) — die is nuttig en onschadelijk
- Voeg `pointer-events-none` toe aan alle absolute-positioned badge/overlay divs zodat ze nooit klikken opvangen

**Bestand: `src/index.css`**

- Verwijder of vereenvoudig de `.card-3d-tilt` en `.card-3d-tilt-inner` CSS — geen transforms meer nodig, alleen de hover box-shadow kan blijven

### Wat blijft werken
- Prefetch bij hover (handleMouseEnter)
- Hover border-kleur verandering (CSS `hover:border-primary/30`)
- Hover box-shadow (CSS)
- Image scale op hover (CSS `group-hover:scale-[1.15]`)

### Wat verdwijnt
- Het 3D kantelen van de kaart bij muisbeweging
- Het verplaatsen van de transform-origin van de afbeelding bij muisbeweging

Dit zijn puur decoratieve effecten die de UX actief beschadigen.

### Resultaat
- Eén tik = navigatie, altijd
- Geen transform-transities die klikken blokkeren
- Badges/overlays vangen geen pointer events meer op

