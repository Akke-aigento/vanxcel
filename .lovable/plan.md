

## Kabelcalculator: dynamische productaanbevelingen na berekening

### Idee
Na het berekenen van de aanbevolen kabeldikte, fetchen we de echte producten uit de SellQo shop en tonen we de matchende kabel (en zekering) als een visuele productkaart met afbeelding, prijs en "Voeg toe aan winkelwagen" CTA — direct vanuit de calculator. Geen dode links meer, maar een naadloze tool-to-shop flow.

### Wat er verandert

**Resultaatblok wordt een "aanbeveling-sectie":**
- Na de berekening verschijnt onder de cijfers (stroom, kabeldikte, zekering) een **product recommendation card** voor de aanbevolen kabel
- De card toont: productafbeelding, titel, prijs, en een "Bekijk product" link naar de productdetailpagina
- Optioneel ook een matchende zekering-card ernaast

**Hoe het werkt technisch:**
1. Na `calculate()`, gebruik `useProducts({ collection: 'kabels' })` (of de juiste collectie-slug) om kabels op te halen
2. Match het resultaat (`result.cable` = bv. `6` mm²) tegen de producttitel of variant-titel (zoek naar "6mm" in de titel)
3. Toon de eerste match als een mini-productkaart
4. Zelfde logica voor zekeringen uit de accessories collectie

**Link fix:** Alle huidige hardcoded links (`/shop?collection=cables`, `/shop?collection=accessories`) worden vervangen door de juiste collectie-slugs. We moeten eerst even de juiste slugs bevestigen.

### Vraag aan jou

Wat zijn de juiste collectie-slugs in SellQo voor kabels en accessoires/zekeringen? Bijvoorbeeld `kabels`, `cables`, `accessoires`, `accessories`? Dan kan ik de juiste slugs gebruiken.

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/CableCalculator.tsx` | Producten fetchen na berekening, matchende productkaart tonen, links fixen |
| `src/i18n/locales/{nl,en,fr,de}.json` | Eventueel nieuwe keys voor "Aanbevolen product", "Bekijk product" etc. |

