

## Hero afbeelding groter maken — logo weer zichtbaar

### Probleem
Het logo wordt afgesneden doordat de hero-afbeelding te veel gecropped wordt via `object-[center_30%]` — de bovenkant van de afbeelding (waar het logo visueel ruimte nodig heeft) is niet zichtbaar.

### Aanpassing in `src/components/HeroSection.tsx`

- **Hoogte vergroten**: `h-[85vh] md:h-[75vh]` → `h-[95vh] md:h-[85vh]` — meer ruimte zodat de volledige compositie (logo + titel + CTA's) past
- **Object position aanpassen**: `object-[center_30%]` → `object-[center_20%]` — minder crop van de bovenkant, zodat het logo-gebied van de achtergrondafbeelding zichtbaar blijft

### Alleen dit bestand wordt aangepast:
- `src/components/HeroSection.tsx`

