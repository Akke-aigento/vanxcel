

## Auto-scroll in Configurator Wizard

### Idee
Bij elke stapwissel scrolt de pagina smooth naar de juiste plek — niet helemaal naar boven, maar naar het begin van de stap-content (net onder de summary bar). Bij grote stappen (resultaten, pakket, installatiegids) scroll naar de bovenkant van de pagina zodat de titel zichtbaar is.

### Aanpak

1. **Ref toevoegen** aan de stap-content container (`<div className="mt-8">`) in `ConfiguratorWizard.tsx`
2. **`useEffect`** op `state.subStep` die smooth scrollt naar:
   - **SubSteps 0-9** (voertuig, gebruik, verbruikers): scroll naar de stap-content ref (net onder de summary bar), met een kleine offset (~-80px voor de navbar)
   - **SubSteps 10-12** (resultaten, pakket, installatiegids): scroll naar de top van de pagina (`window.scrollTo`) zodat de titel + summary bar zichtbaar zijn
3. Gebruik `scrollIntoView({ behavior: 'smooth', block: 'start' })` of `window.scrollTo({ top, behavior: 'smooth' })`
4. Korte `setTimeout` (50ms) zodat de DOM eerst gerenderd is

### Bestand

| Bestand | Wijziging |
|---|---|
| `src/components/configurator/ConfiguratorWizard.tsx` | Ref op content container + useEffect op subStep voor smooth scroll |

