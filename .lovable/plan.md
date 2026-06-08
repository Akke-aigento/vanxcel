## Aanpassingen

1. **`src/components/Navbar.tsx`** — dropdown uitlijning fixen (desktop + mobile, regels ~182-195 en ~337-350):
   - `min-w-[220px]` → `min-w-[260px]` op de dropdown container zodat "Package Simulator" niet meer wrapt.
   - `whitespace-nowrap` toevoegen aan de label-span en `flex-shrink-0` op de Soon-badge, zodat label + badge altijd op één regel staan en netjes uitgelijnd zijn met de andere items.

2. **`src/pages/Calculator.tsx`** — 4e tab toevoegen voor Configurator:
   - `TabsTrigger value="configurator"` met 🚐 icoon, "Soon" badge, `disabled` (zelfde stijl als build-tab).
   - `TabsContent value="configurator"` met "Coming soon" placeholder (zelfde tone als de build placeholder), zodat het tab-grid 4 kolommen toont op /calculator (de "All tools" pagina).
   - Niet linken naar /configurator (blijft eigen pagina die ook coming-soon toont); deze tab is puur visuele consistentie.

## Niet gewijzigd
- Werkende Power en Cable calculators blijven ongemoeid.
- Eigen `/configurator` route blijft bestaan zoals hij nu is.
- Geen tekst/i18n wijzigingen nodig (gebruik bestaande `configurator.navLabel`).
