

## VanXcel — Grondige Analyse: Wat Moet Er Nog Gebeuren

Na het doorlichten van alle bestanden, dit zijn de openstaande issues en verbeterpunten:

---

### 1. Externe links naar vanxcel.be vervangen door interne routes

Meerdere componenten linken nog naar `vanxcel.be` in plaats van interne `/shop` routes:

- **HeroSection.tsx** — "Bekijk Kits →" linkt naar `https://www.vanxcel.be/collections` → moet `/shop` worden
- **Build.tsx** — "Bekijk dit pakket" links gaan naar `vanxcel.be/collections/{slug}` → moet `/shop?collection={slug}` worden (2 plekken: hoofdaanbeveling + alternatief)
- **Calculator.tsx** — links naar `vanxcel.be/collections/cables` en `vanxcel.be/collections/accessories` → moeten interne shop links worden
- **Newsletter.tsx** — stuurt naar `vanxcel.be/account/register` → dit kan zo blijven (er is geen lokaal accountsysteem) OF de newsletter flow moet via SellQo `/contact` of een eigen implementatie
- **CartDrawer.tsx** — checkout URLs gebruiken `vanxcel.be/bedankt` en `vanxcel.be/shop` → moeten `window.location.origin + '/bedankt'` en `window.location.origin + '/shop'` worden zodat het werkt op elk domein (.be, .nl, .com)

### 2. ProductCard badge positioning is broken

De `absolute` positioned badges (korting %, uitverkocht, bijna op) staan in een container die **geen** `relative` class heeft. Ze verschijnen dus niet correct boven de afbeelding.

**Fix:** Voeg `relative` toe aan de `aspect-square` wrapper div.

### 3. Meertaligheid (i18n) ontbreekt nog

Was eerder besproken maar nog niet geïmplementeerd. Alle teksten zijn hardcoded in het Nederlands. Dit is een grote feature — apart op te pakken.

### 4. SEO & Meta tags

Geen `<title>`, `<meta description>` of Open Graph tags. Voor een e-commerce site is dit cruciaal. Kan met `react-helmet-async`.

### 5. ThankYou pagina mist Footer

De `/bedankt` pagina heeft geen `<Footer />` component.

### 6. Checkout URLs zijn hardcoded

De success/cancel URLs in CartDrawer moeten dynamisch het huidige domein gebruiken (`window.location.origin`) zodat het werkt op vanxcel.nl, .be en .com.

---

### Aanbevolen aanpak (prioriteit)

| # | Taak | Impact |
|---|------|--------|
| 1 | Externe vanxcel.be links → interne routes | Hoog — core UX broken |
| 2 | ProductCard `relative` fix | Medium — visuele bug |
| 3 | Checkout URLs dynamisch maken | Hoog — checkout werkt niet op .nl/.com |
| 4 | Footer toevoegen aan ThankYou | Klein — consistentie |
| 5 | SEO/meta tags | Medium — vindbaarheid |
| 6 | i18n (NL/EN/FR/DE) | Groot — aparte sprint |

Ik zou **items 1-4 in één keer** aanpakken. Items 5 en 6 als vervolgstappen.

