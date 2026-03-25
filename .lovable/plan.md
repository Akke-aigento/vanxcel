

## Dynamische Prijzen in Configurator

### Probleem
Prijzen in `vanxcel-products.ts` zijn hardcoded. Als de winkelprijzen veranderen, blijven configurator-prijzen achter. Daarnaast tonen "coming soon" producten nu ook prijzen, wat niet gewenst is.

### Aanpak

**1. SellQo producten ophalen en prijzen matchen**

Maak een nieuwe hook `useVanXcelPrices()` in `src/hooks/use-vanxcel-prices.ts`:
- Haalt alle producten op via de bestaande `useProducts()` hook uit SellQo
- Matcht SellQo producten aan VanXcel catalog items via `shopUrl` slug (de `shopUrl` bevat het slug, bijv. `/shop/vanxcel-5-in-1-converter-1000w`)
- Retourneert een `Map<sku, number>` met live prijzen
- Fallback: als een product niet in de shop staat (coming soon), gebruik dan geen prijs

**2. Prijs-overlay functie toevoegen aan `vanxcel-products.ts`**

Nieuwe export: `applyLivePrices(products, priceMap)` die een kopie van de productlijst retourneert met:
- Live prijzen waar beschikbaar (uit SellQo API)
- `price: 0` voor coming soon producten (zodat ze geen prijs tonen)
- Hardcoded fallback-prijs als SellQo niet bereikbaar is

**3. StepResults.tsx aanpassen**
- `useVanXcelPrices()` aanroepen
- Prijzen in de 4 kaarten komen uit live data
- Coming soon producten: geen prijs tonen (verberg `€` regel)
- `estimatedPrice` berekening alleen op basis van in-stock items met live prijs

**4. StepPackage.tsx aanpassen**
- `useVanXcelPrices()` aanroepen
- Per product-card: live prijs tonen als beschikbaar
- Coming soon items: prijs verbergen, alleen "Coming soon" badge + "Notificeer mij"
- Out-of-stock items (niet coming soon, wel in shop): live prijs nog steeds tonen
- Prijssplit: "Direct bestelbaar" toont alleen in-stock totaal, "Coming soon" toont "—" i.p.v. bedrag

**5. configurator-package.ts aanpassen**
- `generatePackage` accepteert optionele `priceOverrides: Map<string, number>` parameter
- Als override beschikbaar, gebruik die prijs; anders fallback naar hardcoded
- Coming soon items krijgen `unitPrice: 0` in het pakket

### Bestanden

| Bestand | Actie |
|---|---|
| `src/hooks/use-vanxcel-prices.ts` | Nieuw — hook die SellQo prijzen matcht aan SKUs |
| `src/lib/vanxcel-products.ts` | Kleine aanpassing — `applyLivePrices()` helper |
| `src/lib/configurator-package.ts` | `generatePackage` accepteert priceOverrides, coming soon items price=0 |
| `src/components/configurator/StepResults.tsx` | Live prijzen gebruiken, coming soon zonder prijs |
| `src/components/configurator/StepPackage.tsx` | Live prijzen gebruiken, coming soon verbergt prijs |

