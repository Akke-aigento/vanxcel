

## Configurator Stap 5: Productpakket

### Overzicht
Na subStep 12 (berekening) vervangt subStep 13 de huidige placeholder met een compleet productpakket-overzicht. Een `generatePackage()` functie stelt op basis van de berekeningsresultaten een lijst hardcoded producten samen met prijzen.

### Nieuwe bestanden

| Bestand | Beschrijving |
|---|---|
| `src/lib/configurator-package.ts` | `generatePackage()` functie + `PackageItem` type — stelt productlijst samen op basis van configurator state + berekende waarden |
| `src/components/configurator/StepPackage.tsx` | Productpakket UI: samenvatting header, productlijst per categorie, actie-buttons, zijpaneel-samenvatting |

### Logica (`configurator-package.ts`)

```typescript
interface PackageItem {
  category: string;        // battery, solar, inverter, dc_dc, cable, fuse, accessory
  name: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  icon: string;            // lucide icon name
}
```

`generatePackage()` ontvangt de configurator state + berekende waarden (batteryAh, solarWp, inverterW, dcDcA) en retourneert een `PackageItem[]` met:
- Batterij (prijs afhankelijk van Ah, meerdere stuks als >200Ah)
- Zonnepanelen + MPPT regelaar
- Omvormer (alleen als 230V apparaten)
- DC-DC lader
- Bekabelingspakket (altijd)
- Zekeringkast (altijd)
- Battery monitor (als ≥100Ah)

### UI (`StepPackage.tsx`)

**Header bar**: aantal items, totaalprijs, "Op maat voor jouw [voertuig]"

**Productlijst per categorie**: kaarten met icoon, naam, specs, reden (accent), prijs × aantal = totaal. Quantity +/- knoppen.

**Actie-buttons**:
- "Voeg alles toe aan winkelwagen" → toast "Komt binnenkort"
- "Bewaar configuratie" → toast
- "Download als PDF" → toast

**Sidebar/onderaan**: compacte systeem-samenvatting met alle specs + totaalprijs

### ConfiguratorWizard aanpassen

- subStep 13: render `StepPackage` ipv placeholder tekst
- StepResults `onNext` → subStep 13 (al bestaand)
- Berekeningswaarden doorgeven aan StepPackage (of herberekenen in component)

### VehicleSummaryBar
Crumb "Pakket" bij subStep 13.

### i18n keys (alle 4 talen)
Keys voor: `packageTitle`, `packageSubtitle`, `totalItems`, `totalPrice`, `tailoredFor`, `addAllToCart`, `saveConfig`, `downloadPdf`, `comingSoon`, categorie-labels, `perUnit`, `subtotal`, `systemSummary`, `estimatedAutarky`

### Bestanden

| Bestand | Actie |
|---|---|
| `src/lib/configurator-package.ts` | Nieuw |
| `src/components/configurator/StepPackage.tsx` | Nieuw |
| `src/components/configurator/ConfiguratorWizard.tsx` | subStep 13 → StepPackage, import |
| `src/components/configurator/VehicleSummaryBar.tsx` | Crumb "Pakket" |
| `src/i18n/locales/nl.json` | Nieuwe keys |
| `src/i18n/locales/en.json` | Nieuwe keys |
| `src/i18n/locales/fr.json` | Nieuwe keys |
| `src/i18n/locales/de.json` | Nieuwe keys |

