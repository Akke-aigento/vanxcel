## Doel
Package Simulator (tab "build" in /calculator) net als de Configurator markeren als "Soon" en niet publiek toegankelijk maken. Mijn vorige wijziging (verwijderen `/build` route) was niet wat je bedoelde — die route was een aparte oude pagina. Ik draai dat terug en pas de juiste plek aan.

## Aanpassingen

1. **`src/App.tsx`** — `/build` route + `Build` import herstellen (revert van vorige loop), zodat niets onbedoeld verbroken raakt.

2. **`src/components/Navbar.tsx`** — `toolItems` aanpassen:
   - Item `toolsHub.tabBuild` (Package Simulator) krijgt `comingSoon: true`.
   - Hierdoor toont menu automatisch de "Soon" badge en een toast i.p.v. navigatie, exact zoals nu bij Configurator.

3. **`src/pages/Calculator.tsx`** — tab "build":
   - `TabsTrigger value="build"` krijgt een kleine "Soon" badge en `disabled`.
   - `TabsContent value="build"` vervangen door een eenvoudige "Coming soon" placeholder (kopieert tone van configurator coming-soon), zodat directe URL `/calculator?tab=build` niets functioneels toont.
   - `tabMap` valt terug naar `power` als param `build` is.

## Wat blijft hetzelfde
- Power Calculator en Cable Calculator blijven volledig werkend.
- Configurator gedrag ongewijzigd.
- Geen wijzigingen aan business logic of backend.
