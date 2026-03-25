

## VanXcel Product-Centric Configurator Overhaul

This is a large restructuring across 7 areas. Here is the implementation plan.

### 1. Create Product Catalog

**New file: `src/lib/vanxcel-products.ts`**
- Contains the full `VanXcelProduct` interface and `vanxcelProducts` array with all ~45 SKUs as specified
- Helper lookup functions: `getProduct(sku)`, `getProductsByCategory(cat)`

### 2. Rewrite Calculation Logic

**Edit: `src/lib/configurator-calculations.ts`**
- Keep existing helpers: `getDaysAutark`, `getSunHours`, `getDailySolarYield`, `calculateBattery`, `calculateSolar`, `get230vStats`
- Add new functions that return VanXcel products:
  - `selectConverter(peakW, has230v)` — always returns a converter (1000W default, 1500W for heavier loads, warning if >1500W with 3000W coming soon mention)
  - `selectBattery(requiredAh)` — maps to VXBAT100S/200/300 or multiple 200Ah units
  - `selectSolar(requiredWp)` — caps at 500Wp (converter limit), returns panel product + quantity + warning
  - `selectANLFuse(converterSku)` — returns matching ANL fuse based on converter's `fuseRequired` spec
- Remove `calculateInverter` and `calculateDcDc` (replaced by converter selection)

### 3. Rewrite Package Generation

**Edit: `src/lib/configurator-package.ts`**
- New `PackageItem` interface adds: `sku`, `inStock`, `comingSoon`, `shopUrl`, `configuratorUse`
- New `PackageResult` adds: `converterProduct`, `batteryProduct`, `totalInStock`, `totalComingSoon`, `savingsHighlight`
- `generatePackage()` builds package from real VanXcel SKUs:
  - Converter (always), Battery, Solar + mounting kit + roof gland (if solar>0), ANL fuse (matched to converter), Battery disconnect, Negative busbar, Fuse box (12-slot for regular/fulltime, 6-slot for weekend/stealth), Blade fuse pack, Cables (per route with calculated lengths from DB data), Heatshrink, Cable ties, Ring terminals, Switch panel (if >3 appliances), 230V outlets (if converter present), USB outlets (if USB appliances selected), Battery monitor shunt (if >=100Ah), CEE-16A shore power (if regular/fulltime)
- Cable items use per-meter pricing and calculated route distances

### 4. Rewrite StepResults (Result Cards)

**Edit: `src/components/configurator/StepResults.tsx`**
- Card 1: **VanXcel Converter** — teal accent (#008593), "5-IN-1" badge, feature list (inverter W, 25A DC-DC, 500Wp MPPT, 230V shore power, 25ms UPS), price. Warning if peak > continuous rating.
- Card 2: **Battery** — green accent, product name + price, capacity progress bar
- Card 3: **Solar** — yellow accent, panel count + Wp, "Direct op VanXcel Converter (MC4)". Warning if >500Wp needed.
- Card 4: **Alternator Laden** — orange accent, "25A DC-DC Ingebouwd", no separate product, "Zit in je VanXcel Converter"
- Summary row: battery Ah, solar Wp, VanXcel converter W, estimated total price

### 5. Rewrite StepPackage (Product List)

**Edit: `src/components/configurator/StepPackage.tsx`**
- Each product card shows: name, price x qty, availability badge (green "Op voorraad" / orange "Tijdelijk uitverkocht" / blue "Coming soon")
- In-stock items: "Voeg toe" button (links to shopUrl)
- Out-of-stock/coming soon: "Notificeer mij" button -> inline email input -> saves to `product_notifications` table -> toast confirmation
- New category order: converter, battery, solar, fuse, safety, cable, panel, accessory
- Price split summary: "Direct bestelbaar: EUR X | Coming soon: EUR Y | Totaal: EUR Z"
- Savings highlight banner: "De VanXcel 5-in-1 Converter vervangt een losse omvormer, DC-DC lader, MPPT regelaar en walstroomlader -- besparing van meer dan EUR 500!"

### 6. Database Migration

**New table: `product_notifications`**
```sql
CREATE TABLE product_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  product_sku text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);
ALTER TABLE product_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON product_notifications FOR INSERT WITH CHECK (true);
```

### 7. Update StepInstallGuide References

**Edit: `src/components/configurator/StepInstallGuide.tsx`**
- Replace generic "omvormer", "DC-DC lader", "MPPT regelaar" references with "VanXcel Converter"
- Update Phase 4 connection instructions to reference the 5-in-1 (single device connections instead of 3 separate devices)
- Note that 16mm² battery cables are included with the converter

### 8. Step Flow Cleanup

**Edit: `src/components/configurator/ConfiguratorWizard.tsx`**
- Verify no dead confirmation steps exist between usage/appliances/results transitions
- Current flow already skips from persons (subStep 8) -> appliances (9) -> results (10) which looks correct

### 9. Localization

**Edit all 4 locale files** (`nl.json`, `en.json`, `fr.json`, `de.json`)
- Add ~40 new keys for: converter card labels, 5-in-1 feature descriptions, stock status badges, notify-me UI, savings highlight, price split labels

### Safety Preserved

All previous safety measures carry over:
- ANL fuse now maps to specific VanXcel SKU (200A for 1000W, 250A for 1500W)
- Battery disconnect = VXSWITCH200
- Negative busbar = VXBUSBAR
- Minimum cable sizes enforced (unchanged logic in install guide)
- LiFePO4 0C warning, 230V RCD warning, disclaimer all remain

### Files Summary

| File | Action |
|---|---|
| `src/lib/vanxcel-products.ts` | Create (product catalog) |
| `src/lib/configurator-calculations.ts` | Rewrite (add product selectors, remove old inverter/dcdc) |
| `src/lib/configurator-package.ts` | Rewrite (VanXcel products, availability, cables by route) |
| `src/components/configurator/StepResults.tsx` | Rewrite (4 VanXcel-centric cards) |
| `src/components/configurator/StepPackage.tsx` | Rewrite (availability badges, notify-me, savings) |
| `src/components/configurator/StepInstallGuide.tsx` | Update references to VanXcel Converter |
| `src/components/configurator/ConfiguratorWizard.tsx` | Verify step flow (minor if any) |
| `src/i18n/locales/*.json` | Add ~40 new keys per file |
| DB migration | Create `product_notifications` table |

