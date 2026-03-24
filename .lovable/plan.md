

## Over Ons pagina aanmaken

### Huidige situatie
- Navbar linkt naar `/#about` maar er is geen `/about` route of pagina
- De originele Shopify pagina bevat: intro, verhaal (Mongolië reis), visie, waarom VanXcel, en community CTA

### Plan

#### 1. Nieuwe pagina: `src/pages/About.tsx`
Een visueel aantrekkelijke About-pagina met dezelfde design-taal als de rest van de site (dark theme, scroll reveals, animaties). Secties:

- **Hero banner**: Grote titel "OVER VANXCEL" met subtitel, dezelfde stijl als andere pagina's
- **Intro sectie**: "Welkom bij VanXcel" — missie kort samengevat
- **Ons Verhaal**: Het persoonlijke verhaal (busjes ombouwen, Mongolië reis 2022), met RevealOnScroll animaties
- **Onze Visie**: Complete uitrustingssets, richtlijnen, bewezen oplossingen — als icon-cards of feature grid
- **Waarom VanXcel**: 3 USP's (passie, gemak, kwaliteit) als visuele kaarten
- **CTA sectie**: "Begin je avontuur" met link naar shop

Tekst is gebaseerd op de Shopify content maar iets moderner/strakker herschreven. Veel SEO-relevante keywords: LiFePO4, campervan ombouw, off-grid, België.

#### 2. Route toevoegen in `src/App.tsx`
- Import `About` pagina
- Route: `/about`

#### 3. Navbar link fixen in `src/components/Navbar.tsx`
- `/#about` → `/about`

#### 4. i18n keys toevoegen
- Nieuwe `about` sectie in alle 4 locale bestanden (nl, en, fr, de)

### Bestanden

| Bestand | Actie |
|---|---|
| `src/pages/About.tsx` | Nieuw — volledige Over Ons pagina |
| `src/App.tsx` | Route `/about` toevoegen |
| `src/components/Navbar.tsx` | Link `/#about` → `/about` |
| `src/i18n/locales/nl.json` | About i18n keys (NL) |
| `src/i18n/locales/en.json` | About i18n keys (EN) |
| `src/i18n/locales/fr.json` | About i18n keys (FR) |
| `src/i18n/locales/de.json` | About i18n keys (DE) |

