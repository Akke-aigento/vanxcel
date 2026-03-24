

## Analyse: Shopify vs. Nieuwe site — Wat ontbreekt er nog?

### Wat de Shopify-site heeft vs. wat de nieuwe site al heeft

| Shopify pagina | Nieuwe site | Status |
|---|---|---|
| Homepage (hero, categorieën, reviews, newsletter) | `/` | **Aanwezig** |
| Shop / Collecties overzicht | `/shop`, `/categories` | **Aanwezig** |
| Productdetail pagina's | `/shop/:slug` | **Aanwezig** |
| Over ons | `/about` | **Aanwezig** |
| Contact | `/contact` | **Aanwezig** |
| Kabelcalculator | `/calculator?tab=cable` | **Aanwezig** |
| Build Your Power System | `/calculator?tab=build` | **Aanwezig** |
| **FAQ pagina** | — | **ONTBREEKT** |
| **Levering / Bezorginfo pagina** | — | **ONTBREEKT** |
| **Elektrische schema's & handleidingen** (login-gated) | — | **ONTBREEKT** |
| Kortingspakketten (TheSMALL, TheBIG) | Via shop collecties | **Aanwezig** (via SellQo) |
| Solar Panels collectie | Via shop | **Aanwezig** (via SellQo) |
| Off-road collectie | Via shop | **Aanwezig** (via SellQo) |
| Gift Card collectie | Via shop | **Aanwezig** (via SellQo) |

### Aanbevolen acties — 3 pagina's toevoegen

#### 1. FAQ pagina (`/faq`)
Content uit Shopify overnemen, georganiseerd in accordeons:
- **Producten & Installatie** (3 vragen)
- **Batterijen en technologie** (3 vragen)
- **Verzending en levering** (3 vragen)
- **Andere vragen** (3 vragen)

Accordion-component is al aanwezig in `src/components/ui/accordion.tsx`. Geweldige SEO-pagina met FAQ structured data (JSON-LD).

#### 2. Levering / Bezorginfo pagina (`/delivery`)
Content uit Shopify overnemen:
- Bezorgopties per land (BE: gratis >€25, NL: gratis >€25)
- VanXcel Premium bezorging voor grote pakketten
- Duurzaamheids-sectie
- "Hoe het werkt" stappen

#### 3. Elektrische schema's & handleidingen (`/manuals`)
Op Shopify is dit login-gated ("You must have placed an order"). We kunnen dit simpel houden:
- Pagina met uitleg dat handleidingen per e-mail komen bij bestelling
- Of een downloadbare PDF-sectie (later uit te breiden)

### Wat er verder nog bij kan (nice-to-have)
- **Footer links updaten** — FAQ en Levering toevoegen aan footer navigatie
- **Navbar** — optioneel FAQ/Levering links toevoegen onder een "Info" dropdown

### Bestanden

| Bestand | Actie |
|---|---|
| `src/pages/FAQ.tsx` | Nieuw — FAQ pagina met accordeons |
| `src/pages/Delivery.tsx` | Nieuw — Bezorginfo pagina |
| `src/pages/Manuals.tsx` | Nieuw — Schema's & handleidingen pagina |
| `src/App.tsx` | 3 routes toevoegen |
| `src/components/Footer.tsx` | FAQ + Levering links toevoegen |
| `src/i18n/locales/nl.json` | Nieuwe keys voor alle 3 pagina's |
| `src/i18n/locales/en.json` | Vertalingen |
| `src/i18n/locales/fr.json` | Vertalingen |
| `src/i18n/locales/de.json` | Vertalingen |

