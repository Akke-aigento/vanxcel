

## Shop Dropdown in Navbar + Categorieen Pagina

### Wat er verandert

1. **Navbar "Shop" wordt een dropdown** (hover op desktop, tap op mobiel) met:
   - "Alle producten" → `/shop`
   - Alle top-level categorieen uit SellQo (in API-volgorde), elk met subcategorieen indien aanwezig → `/shop?collection={slug}`
   - Scheidingslijn
   - "Alle categorieen" → `/categories`

2. **"Producten" link verwijderd** uit de navbar

3. **Nieuwe pagina `/categories`** — overzicht van alle actieve categorieen met afbeelding, titel en productcount, in SellQo-volgorde. Hergebruikt de `categoryImages` mapping uit `CategoryGrid.tsx`.

### Technische aanpak

**`src/components/Navbar.tsx`**
- Verwijder `nav.products` uit `navLinks`
- De "Shop" link wordt een custom dropdown-element ipv een gewone Link
- Gebruikt `useCollections()` hook + `normalizeCollections()` om categorieen op te halen
- Desktop: hover-triggered dropdown (CSS `group-hover` of state)
- Mobiel: in het mobile menu wordt "Shop" een expandable sectie met dezelfde items
- Categorieen met `parent_id` worden als sub-items onder hun parent getoond

**`src/pages/Categories.tsx`** (nieuw)
- Toont alle top-level categorieen als cards (afbeelding + titel + productcount)
- Subcategorieen worden genest getoond onder hun parent
- Link naar `/shop?collection={slug}` per categorie

**`src/App.tsx`**
- Voeg route `/categories` toe

**`src/i18n/locales/{nl,en,fr,de}.json`**
- Nieuwe keys: `nav.allProducts`, `nav.allCategories`, `categories.pageTitle`, `categories.pageSubtitle`

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/Navbar.tsx` | Dropdown voor Shop, verwijder Producten link |
| `src/pages/Categories.tsx` | Nieuw — categorieen overzichtspagina |
| `src/App.tsx` | Route `/categories` toevoegen |
| `src/i18n/locales/*.json` | Nieuwe vertaalsleutels |

