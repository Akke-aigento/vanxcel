

## Transformatie StepInstallGuide naar Stapsgewijze Handleiding

### Overzicht
Volledige herschrijving van `StepInstallGuide.tsx` (~592 regels) naar een fasegerichte installatiegids met 7 fasen (0-6). De huidige losse secties (waarschuwingen, batterijlocaties, kabelroutes, aardpunten, kabeltabel) worden geïntegreerd IN de relevante fasen. De bekabelingstabel wordt een uitklapbare referentiesectie onderaan.

### Structuur

**Bovenaan (blijft):**
- Terug-button + titel
- 4 veiligheidswaarschuwingen (rood/oranje banners)
- Voertuig-specifieke waarschuwingen uit DB
- **Nieuw: Progress indicator** — "Fase X van 6" met visuele balk

**7 Accordion fasen (elke fase is een Card met AccordionTrigger):**

| Fase | Titel | Tijd | Moeilijkheid | Dynamische content |
|---|---|---|---|---|
| 0 | Voorbereiding & Planning | 1-2u | Makkelijk | Starterbatterij locatie uit `motorisation.starter_battery_location`, gereedschapslijst |
| 1 | Leisure batterij monteren | 1-3u | Gemiddeld | Batterijlocaties uit DB, ANL fuse maat, batterij Ah |
| 2 | Zekeringkast & busbars | 1-2u | Makkelijk | Statisch + zekering-waarden |
| 3 | Kabels trekken | 3-6u | Moeilijk | Cable routes uit DB (afstand, beschrijving, gevaren, bescherming), berekende kabeldiktes, conditionele routes (solar/omvormer) |
| 4 | Alles aansluiten | 2-4u | Gemiddeld | Conditionele stappen (MPPT/omvormer/DC-DC), batterij Ah |
| 5 | Systeem testen | 1-2u | Makkelijk | Conditionele tests per component |
| 6 | Afwerken & documenteren | 1-2u | Makkelijk | 230V keuring waarschuwing conditioneel |

**Elke fase bevat:**
- Header: nummer + titel + badges (tijd, moeilijkheid)
- Genummerde instructielijst (`<ol>`)
- "Let op" Alert-blokken (oranje/rood) inline
- "Benodigde materialen" compact blokje met iconen
- `<Checkbox>` "Fase afgerond" onderaan (lokale useState array, niet persistent)

**Conditionele rendering:**
- Solar-gerelateerde stappen alleen als `calc.solarWp > 0`
- Omvormer-gerelateerde stappen alleen als `calc.inverterW > 0`
- Batterijlocatie-instructies op basis van eerste (meest populaire) `batteryLocations` entry
- Kabeldiktes, afstanden, gevaren uit DB hooks + berekeningen

**Onderaan:**
- Uitklapbare "Bekabelingsoverzicht" Accordion met de bestaande kabeltabel (verplaatst)
- Disclaimer (blijft)

### Technische aanpak

De bestaande helper-functies (`calcCableSize`, `getMinCableSize`, `getFuseSpec`, severity/difficulty configs) blijven. De hooks en calc useMemo blijven. Alleen de JSX return wordt herschreven.

Lokale state voor checkboxes:
```typescript
const [completedPhases, setCompletedPhases] = useState<number[]>([]);
```

De fasen worden opgebouwd als een array van objecten die conditioneel stappen bevatten, zodat de rendering clean blijft.

### i18n

Grote hoeveelheid nieuwe keys (50+) voor alle fase-titels, instructies, waarschuwingen, materialen. Alle 4 talen.

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/configurator/StepInstallGuide.tsx` | Volledige herschrijving — fasegerichte accordion-structuur met dynamische content |
| `src/i18n/locales/nl.json` | ~60 nieuwe keys voor fase-titels, instructies, materialen, waarschuwingen |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

