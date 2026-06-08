## Probleem
Op mobiel toont de hero-afbeelding voornamelijk de lucht/wolken. De van + bergen (de échte focus van het beeld) zijn afgesneden onderaan, waardoor de layout leeg/onevenwichtig voelt.

Oorzaak: `object-[center_20%]` in `src/components/HeroSection.tsx` werkt goed op desktop (breed beeld) maar op smal mobile-viewport zit het focuspunt te hoog.

## Aanpassing
**`src/components/HeroSection.tsx`** (regel 37):
- Image className wijzigen van `object-[center_20%]` naar `object-[center_70%] md:object-[center_20%]`.
- Resultaat: op mobiel komt de van + bergen omhoog in beeld; desktop blijft ongewijzigd.

Optioneel binnen dezelfde regel: hero hoogte op mobile iets terugbrengen (`h-[100vh]` → `h-[85vh] md:h-[90vh]`) zodat scroll-indicator en CTA's beter zichtbaar zijn zonder scroll. Doe ik mee als kleine extra finetune.

## Niet gewijzigd
- Geen wijzigingen aan asset, kopij of CTA-gedrag.
- Geen wijzigingen aan andere pagina's.
