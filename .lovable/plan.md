

## Hero inkorten + Logo integreren

### Wijzigingen

**1. Logo kopiëren naar project**
- Kopieer `user-uploads://EDIT_WHITE_2.png` naar `src/assets/logo-white.png`

**2. `src/components/HeroSection.tsx`**
- Verklein hoogte van `h-screen` naar `h-[75vh]` (korter van boven, de afbeelding wordt gecropped via `object-[center_30%]` zodat de bovenkant afgesneden wordt)
- Voeg het witte logo toe boven de titel, als visueel middelpunt — geschaald op ~180px breed op mobile, ~240px op desktop
- Layout: logo → titel → subtitle → CTA's, allemaal gecentreerd onderaan

**3. `src/components/Navbar.tsx`**
- Vervang de tekst "VANXCEL" door het logo als kleine `<img>` (hoogte ~28px), zodat het logo ook in de navbar zit

### Geen andere bestanden worden aangepast.

