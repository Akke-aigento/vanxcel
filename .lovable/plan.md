

## Hero achtergrond vervangen

De geüploade afbeelding `Hero_vanxcel.png` wordt de nieuwe hero achtergrond.

### Wijzigingen

**1. Afbeelding kopiëren**
- `user-uploads://Hero_vanxcel.png` → `src/assets/hero-bg.jpg` (overschrijft de huidige hero achtergrond)

**2. `src/components/HeroSection.tsx`**
- Geen codewijzigingen nodig — het component importeert al `@/assets/hero-bg.jpg`, dus de nieuwe afbeelding wordt automatisch opgepikt.
- De overlay gradient en tekst-layout blijven behouden.

