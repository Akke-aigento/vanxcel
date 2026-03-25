
## Sticky header fix (definitief)

### Waarschijnlijke root-cause
De header staat `position: fixed`, maar alle pagina’s zitten binnen `AnimatedOutlet` met een CSS `transform` op `.page-enter/.page-exit` (`translateY(...)`).  
Een getransformeerde parent breekt fixed-position gedrag (header kan “meescrollen” of vreemd positioneren).

### Plan van aanpak

1. **Route-transitie aanpassen zodat fixed header niet meer breekt**
   - In `src/index.css`:
     - `.page-transition`: transition alleen op `opacity` (geen `transform`).
     - `.page-enter`: `opacity: 1` (zonder transform).
     - `.page-exit`: `opacity: 0` (zonder transform).
   - Resultaat: page-fade blijft, maar navbar blijft echt viewport-fixed.

2. **Header-offsets uniform maken op pagina’s met te weinig top spacing**
   - `src/pages/Build.tsx` en `src/pages/Configurator.tsx` gebruiken nu `pt-16` terwijl navbar `h-20` is.
   - Verhogen naar minimaal `pt-20` (of `pt-24` voor extra lucht) zodat content niet onder de header schuift.

3. **Controle op regressies in navigatie/transities**
   - Bevestigen dat dropdowns/mobile menu van `Navbar` ongewijzigd blijven.
   - Verifiëren dat fade-transitie nog netjes werkt tussen routes.

### Bestanden
- `src/index.css` (page transition classes)
- `src/pages/Build.tsx` (top padding)
- `src/pages/Configurator.tsx` (top padding)

### Acceptatiecriteria
- Header blijft zichtbaar bij scroll op alle pagina’s (desktop + mobiel).
- Geen “meescrollende” of verschuivende navbar meer tijdens routewissels.
- Geen overlap van page content onder de navbar op Build/Configurator.
