

## Meertaligheid (NL, EN, FR, DE) met i18next

### Aanpak

State-based taalwisseling met `i18next` + `react-i18next`. Taal wordt opgeslagen in `localStorage` en kan geschakeld worden via een taalselector in de Navbar. Geen URL-prefixen.

### Bestanden

**1. Nieuwe bestanden**

- `src/i18n/index.ts` — i18next configuratie met `initReactI18next`, fallback `nl`, detectie via `localStorage`
- `src/i18n/locales/nl.json` — Alle Nederlandse teksten (huidige hardcoded strings)
- `src/i18n/locales/en.json` — Engelse vertalingen
- `src/i18n/locales/fr.json` — Franse vertalingen
- `src/i18n/locales/de.json` — Duitse vertalingen
- `src/components/LanguageSwitcher.tsx` — Dropdown met vlaggetjes (🇳🇱 🇬🇧 🇫🇷 🇩🇪)

**2. Bestaande bestanden aanpassen**

Elk component met hardcoded tekst wordt aangepast om `useTranslation()` te gebruiken:

| Component | Aantal te vertalen strings |
|---|---|
| Navbar | 6 nav labels |
| HeroSection | 3 (tagline, subtitle, CTA's) |
| TrustBar | 4 USP labels |
| CategoryGrid | 2 (title, subtitle) |
| FeaturedProducts | 3 (title, subtitle, CTA) |
| PowerCalculator | ~10 (title, labels, recommendation) |
| ComparisonTable | ~12 (title, subtitle, features) |
| ReviewsMarquee | 2 (title, subtitle) |
| Newsletter | 3 (title, subtitle, placeholder) |
| CartDrawer | ~8 (title, empty state, checkout, labels) |
| Footer | 4 (brand desc, headings, copyright) |
| Shop | ~6 (title, filters, sort, empty state) |
| ProductDetail | ~10 (breadcrumb, stock, variant, qty, CTA, related) |
| Build | ~25 (all wizard steps, labels, results) |
| Calculator | ~10 (page title, links, labels) |
| Contact | ~8 (form labels, placeholders, messages) |
| ThankYou | ~5 (title, messages, CTA) |
| NotFound | 3 |

**3. Dependencies**

- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector` (detecteert `localStorage` key)

**4. `src/main.tsx`**

Import `src/i18n/index.ts` voor side-effect initialisatie.

### Structuur vertaalbestanden

```json
{
  "nav": { "home": "Home", "shop": "Shop", ... },
  "hero": { "title": "Power Your Journey.", "subtitle": "...", ... },
  "trust": { "warranty": "2 Year Warranty", ... },
  "categories": { "title": "SHOP BY CATEGORY", ... },
  "bestsellers": { "title": "BESTSELLERS", ... },
  "calculator": { "title": "POWER CALCULATOR", ... },
  "comparison": { "title": "LIFEPO4 VS AGM", ... },
  "reviews": { "title": "CUSTOMER REVIEWS", ... },
  "newsletter": { "title": "GET 10% OFF", ... },
  "cart": { "title": "Shopping Cart", ... },
  "shop": { "title": "SHOP", ... },
  "product": { "addToCart": "Add to Cart", ... },
  "build": { "title": "BUILD YOUR SYSTEM", ... },
  "contact": { "title": "Contact", ... },
  "footer": { "followUs": "FOLLOW US", ... },
  "thankYou": { ... },
  "notFound": { ... }
}
```

### LanguageSwitcher

Klein dropdown-component in de Navbar, naast het cart-icoon. Toont de huidige taal als vlaggetje, opent een dropdown met de 4 opties. Bij selectie: `i18n.changeLanguage(lng)` — alles re-rendert automatisch.

### Domein-detectie (optioneel, voorbereiding)

In de i18n config wordt `window.location.hostname` gecheckt als fallback:
- `vanxcel.nl` → `nl`
- `vanxcel.be` → `nl`
- `vanxcel.com` → `en`
- Anders → `nl`

Dit werkt alleen als de domeinen later via proxy worden gekoppeld.

