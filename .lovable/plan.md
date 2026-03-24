

## Tools pagina mobiel layout fixen

### Problemen (zichtbaar in screenshot)
1. **Tabs overflow**: De 3 tab-triggers (Power Calculator, Kabelberekening, Pakket Simulator) passen niet op mobiel — de tekst wordt afgesneden
2. **Titel te groot**: `text-[56px]` is veel te groot op een 390px scherm
3. **Padding-top**: `pt-16` (64px) klopt niet meer met de navbar die nu `h-20` (80px) is

### Aanpassing in `src/pages/Calculator.tsx`

- **pt-16 → pt-20**: padding matchen met navbar hoogte
- **Titel responsive**: `text-[56px]` → `text-3xl md:text-[56px]`
- **Tabs op mobiel**: kortere labels op kleine schermen — gebruik `text-xs` op mobiel, `text-sm` op desktop. Eventueel de emoji's weghalen op mobiel of de tab-tekst inkorten via responsive classes
- **TabsList**: voeg `overflow-x-auto` of `flex-wrap` niet toe — gebruik ipv daarvan kleinere tekst + minder padding zodat alles past

### Alleen dit bestand wordt aangepast:
- `src/pages/Calculator.tsx`

