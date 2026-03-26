

## Audit: VanXcel — Functioneel & Frontend Analyse

### Wat er GOED is
- Homepage hero + trust bar + featured products: visueel sterk
- Login pagina: split-screen redesign ziet er premium uit
- Dark theme is consistent doorgevoerd
- Product cards met 3D tilt, hover-zoom, discount badges: professioneel
- Cart drawer, checkout flow, bundle weergave: functioneel compleet
- i18n in 4 talen aanwezig
- SEO basics: meta tags, OG tags, FAQ JSON-LD

---

### BEVINDINGEN — gerangschikt op impact

#### 1. Console Warnings: forwardRef ontbreekt
`RevealOnScroll` en page components worden als refs doorgegeven maar zijn geen `forwardRef` components. Dit geeft React warnings in de console bij elke pagina. Oplossing: `RevealOnScroll` omzetten naar `forwardRef`.

#### 2. PasswordStrength labels zijn hardcoded Nederlands
`Login.tsx` regel 14-16: "8+ tekens", "Hoofdletter", "Cijfer" — niet vertaald via i18n. Moet `t("auth.pwMin8")` etc. gebruiken.

#### 3. ResetPassword pagina is kaal
Terwijl Login een premium split-screen heeft, is ResetPassword een simpele centered form zonder visuele aantrekkingskracht. Zou dezelfde split-screen treatment moeten krijgen.

#### 4. ProductDetail: BundleContents positie is fout
In `ProductDetail.tsx` (regel 108-110) staat `<BundleContents>` BUITEN de grid-kolommen, waardoor het als een derde rij onder de afbeelding verschijnt. Het hoort IN de rechterkolom bij de productinfo.

#### 5. BundleContents: verkeerde link-URL
`BundleContents.tsx` regel 68: linkt naar `/products/${slug}` maar de route is `/shop/${slug}`.

#### 6. Footer: hardcoded categorieën
`Footer.tsx` heeft hardcoded categorienamen ("Converters", "Accu's", etc.) in het Nederlands — niet vertaald en niet dynamisch.

#### 7. Navbar: account dropdown sluit niet bij klik buiten
De desktop account dropdown (`accountOpen` state) heeft geen click-outside handler. Je moet op het icoon klikken om te sluiten.

#### 8. Geen pagina-specifieke `<title>` of meta tags
Elke pagina toont dezelfde `<title>` ("VanXcel — Power Your Journey"). Geen dynamic document title per route (Shop, FAQ, Contact, etc.) — slecht voor SEO.

#### 9. FAQ: useEffect zonder dependency array
`FAQ.tsx` regel 63-69: de JSON-LD script wordt bij ELKE render opnieuw aangemaakt (geen `[]` dependency). Dit lekt DOM nodes.

#### 10. Contact formulier: `sellqoFetch("/contact")` — foutgevoelig
`Contact.tsx` gebruikt `sellqoFetch` direct voor het contactformulier. Als de endpoint niet bestaat of verandert, is er geen fallback. Geen succes-boodschap vertaling check.

#### 11. Newsletter: `customerApiFetch` ipv `sellqoFetch`
Newsletter component gebruikt `customerApiFetch("newsletter_subscribe")` — dit gaat via de customer-proxy. Controleer of deze action überhaupt bestaat in de SellQo customer API of dat dit een product-API action zou moeten zijn.

#### 12. Toegankelijkheid (a11y) — minimaal
- Navbar hamburger button: geen `aria-label`
- Cart button: geen `aria-label`
- Password toggle button: geen `aria-label`
- Account icon button: geen `aria-label`
- Mobile tab buttons: geen `role="tablist"` / `role="tab"`

#### 13. Shop pagina: geen paginatie
Alle producten worden in één keer geladen. Bij groeiend assortiment wordt dit traag. Geen "load more" of pagination.

#### 14. ProductDetail: geen image gallery
Slechts 1 productfoto getoond (`images[0]`). Als een product meerdere afbeeldingen heeft, worden die genegeerd.

#### 15. Delivery/FAQ/Manuals pagina's: geen visuele differentiatie
Deze drie pagina's hebben exact dezelfde layout-structuur (centered max-w-3xl met RevealOnScroll cards). Ze voelen als templates, niet als unieke pagina's.

---

### VOORGESTELD PLAN

| Prioriteit | Fix | Bestanden |
|---|---|---|
| **P0 — Bugs** | |
| 1 | BundleContents link `/products/` → `/shop/` | `BundleContents.tsx` |
| 2 | BundleContents positie in ProductDetail grid | `ProductDetail.tsx` |
| 3 | FAQ useEffect dependency array fix | `FAQ.tsx` |
| 4 | RevealOnScroll forwardRef (console warnings) | `RevealOnScroll.tsx` |
| **P1 — UX/Polish** | |
| 5 | PasswordStrength i18n | `Login.tsx` + locale files |
| 6 | ResetPassword visueel redesign (split-screen) | `ResetPassword.tsx` |
| 7 | Navbar click-outside handler voor account dropdown | `Navbar.tsx` |
| 8 | Footer categorieën dynamisch + vertaald | `Footer.tsx` |
| **P2 — SEO** | |
| 9 | Dynamic document titles per pagina | Alle page components (react-helmet-async of useEffect) |
| **P3 — Functionaliteit** | |
| 10 | ProductDetail image gallery (thumbnails + lightbox) | `ProductDetail.tsx` |
| 11 | A11y: aria-labels op interactieve elementen | `Navbar.tsx`, `CartDrawer.tsx`, `Login.tsx` |
| 12 | Shop paginatie of "load more" | `Shop.tsx` + hooks |

Totaal: ~12 bestanden, geen database wijzigingen nodig.

