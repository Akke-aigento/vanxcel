

## Fix: Slechte klik-reactiviteit op de website

### Root cause analyse

Er zijn **twee problemen** die samen zorgen voor de slechte klikervaring:

#### 1. AnimatedOutlet blokkeert navigatie
`AnimatedOutlet.tsx` gebruikt `onTransitionEnd` om pagina-wissels af te handelen. Dit event is **onbetrouwbaar**:
- Het bubbelt op van child-elementen (elke `transition` op een kind-element kan het triggeren)
- Als de opacity-transitie niet visueel verandert, vuur het event soms niet
- Resultaat: na klik gaat de state naar `"exit"`, maar `handleTransitionEnd` wordt nooit aangeroepen → de nieuwe pagina verschijnt niet

#### 2. 3D tilt CSS met `transform-style: preserve-3d` en `will-change: transform`
De `card-3d-tilt` wrapper met `perspective` en `preserve-3d` creëert extra compositing layers. De `transition: transform 0.15s` op de inner card betekent dat **elke muisbeweging** een transitie triggert, wat kan botsen met de `onTransitionEnd` van AnimatedOutlet (event bubbling).

### Oplossing

**Bestand 1: `src/components/AnimatedOutlet.tsx`** — Vervang de onbetrouwbare `onTransitionEnd` door een `setTimeout` die matcht met de transitieduur (250ms). Dit is een bewezen patroon voor page transitions:

```tsx
useEffect(() => {
  if (transitionStage === "exit") {
    const timer = setTimeout(() => {
      prevKey.current = location.key;
      setDisplayChildren(children);
      setTransitionStage("enter");
    }, 250); // matches CSS transition duration
    return () => clearTimeout(timer);
  }
}, [transitionStage, children, location.key]);
```

Verwijder de `onTransitionEnd` handler volledig.

**Bestand 2: `src/index.css`** — Voeg `pointer-events: none` toe aan `.page-exit` zodat klikken tijdens de exit-transitie niet geblokkeerd worden, en stop event bubbling van card transitions:

```css
.page-exit {
  opacity: 0;
  pointer-events: none;
}

.card-3d-tilt-inner {
  transition: transform 0.15s ease-out, box-shadow 0.3s ease-out;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  will-change: transform;
}
```

**Bestand 3: `src/components/ProductCard.tsx`** — Voeg `e.stopPropagation()` toe aan de tilt `onMouseMove` handler zodat transform-transities niet bubbelen naar AnimatedOutlet:

De `handleMouseMove` functie aanpassen om propagatie niet te beïnvloeden (het probleem zit in de CSS transition events, niet de mouse events).

### Samenvatting
- **Hoofdfix**: AnimatedOutlet gebruikt `setTimeout(250ms)` i.p.v. `onTransitionEnd`
- **CSS fix**: `pointer-events: none` op `.page-exit`
- 2 bestanden aan te passen

