import type { ConfiguratorState } from "@/components/configurator/ConfiguratorWizard";
import type { Tables } from "@/integrations/supabase/types";
import {
  calculateBattery,
  calculateSolar,
  get230vStats,
  getDaysAutark,
  getDailySolarYield,
  selectConverter,
  selectBatteryProduct,
  selectSolarProduct,
  selectANLFuse,
} from "./configurator-calculations";
import { vanxcelProducts, getProduct, type VanXcelProduct } from "./vanxcel-products";

export interface PackageItem {
  category: string;
  name: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  icon: string;
  sku: string;
  inStock: boolean;
  comingSoon: boolean;
  shopUrl: string | null;
  configuratorUse: string;
  isPerMeter?: boolean;
}

export interface PackageResult {
  items: PackageItem[];
  batteryAh: number;
  solarWp: number;
  converterW: number;
  dcDcA: number;
  totalPrice: number;
  totalInStock: number;
  totalComingSoon: number;
  totalOutOfStock: number;
  daysAutark: number;
  converterProduct: VanXcelProduct;
  batteryProduct: VanXcelProduct;
  converterWarning: string | null;
  solarWarning: string | null;
  savingsHighlight: string;
}

function addItem(
  items: PackageItem[],
  product: VanXcelProduct,
  quantity: number,
  icon: string,
  reasonOverride?: string,
  isPerMeter?: boolean
) {
  items.push({
    category: product.category,
    name: product.name,
    specs: Object.entries(product.specs)
      .filter(([k]) => !['type', 'priceUnit'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 3)
      .join(', '),
    quantity,
    unitPrice: product.price,
    reason: reasonOverride ?? product.configuratorUse,
    icon,
    sku: product.sku,
    inStock: product.inStock,
    comingSoon: product.comingSoon,
    shopUrl: product.shopUrl,
    configuratorUse: product.configuratorUse,
    isPerMeter,
  });
}

export function generatePackage(
  state: ConfiguratorState,
  appliances: Tables<"appliances">[],
  cableRoutes?: Tables<"vehicle_cable_routes">[] | null
): PackageResult {
  const batteryAh = calculateBattery(state.totalDailyWh, state.usageType ?? "regular");
  const maxSolarM2 = state.bodyType?.solar_max_area_m2
    ? Number(state.bodyType.solar_max_area_m2)
    : 4;
  const solarWpRaw = calculateSolar(state.totalDailyWh, state.climate ?? "benelux", maxSolarM2);
  const stats230v = get230vStats(state.selectedAppliances, appliances);
  const daysAutark = getDaysAutark(state.usageType ?? "regular");

  // Converter selection (replaces inverter + DC-DC + MPPT)
  const converterSel = selectConverter(stats230v.peakW, stats230v.count > 0);
  const converterW = Number(converterSel.product.specs.continuousW);

  // Battery selection
  const batterySel = selectBatteryProduct(batteryAh);

  // Solar selection (capped at 500Wp by converter)
  const solarSel = selectSolarProduct(solarWpRaw);
  const solarWp = solarSel.cappedWp;

  // ANL fuse matched to converter
  const anlFuse = selectANLFuse(converterSel.product.sku);

  const items: PackageItem[] = [];

  // 1. Converter (always)
  addItem(items, converterSel.product, 1, 'zap',
    `Hart van je systeem: omvormer ${converterW}W + DC-DC 25A + MPPT tot 500Wp + walstroomlader + UPS — alles in één apparaat.`);

  // 2. Battery
  addItem(items, batterySel.product, batterySel.quantity, 'battery',
    `${batteryAh}Ah voor ${state.totalDailyWh}Wh dagelijks verbruik × ${daysAutark} dagen autonomie.`);

  // 3. Solar panels (if needed)
  if (solarWp > 0) {
    addItem(items, solarSel.product, solarSel.quantity, 'sun',
      `${solarSel.quantity}× ${Number(solarSel.product.specs.wattage)}W = ${solarWp}Wp — sluit direct aan op VanXcel Converter via MC4.`);

    // Roof cable gland
    addItem(items, getProduct('VXDAKDV')!, 1, 'cable',
      'Waterdichte dakdoorvoer voor de solarkabels.');

    // Solar mounting kit
    addItem(items, getProduct('VXSOLMOUNT')!, 1, 'cable',
      'Montagebeugels voor het bevestigen van je panelen op het dak.');

    // Solar cables (6mm²) — estimate route length
    const solarRoute = cableRoutes?.find(r => r.route_id === 'roof_to_interior');
    const solarMeters = Math.ceil(Number(solarRoute?.distance_meters ?? 4) + 1);
    addItem(items, getProduct('VXCAB6SR')!, solarMeters, 'cable',
      `${solarMeters}m solarkabel rood voor paneel → converter.`, true);
    addItem(items, getProduct('VXCAB6SZ')!, solarMeters, 'cable',
      `${solarMeters}m solarkabel zwart.`, true);
  }

  // 4. ANL Fuse (always)
  addItem(items, anlFuse, 1, 'shield',
    `Hoofdzekering ${anlFuse.specs.rating}A — passend bij je VanXcel ${converterW}W Converter. Plaatsen binnen 18cm van batterij+.`);

  // 5. Battery disconnect switch (always)
  addItem(items, getProduct('VXSWITCH200')!, 1, 'power',
    'Noodschakelaar — schakelt het volledige systeem uit. Plaatsen direct NA de hoofdzekering.');

  // 6. Negative busbar (always)
  addItem(items, getProduct('VXBUSBAR')!, 1, 'minus',
    'Centraal punt voor alle negatieve kabels. Verbind met 25mm²+ kabel naar chassis-aarding.');

  // 7. Fuse box (12-slot for regular/fulltime, 6-slot for weekend/stealth)
  const useBigFuseBox = state.usageType === 'regular' || state.usageType === 'fulltime';
  addItem(items, getProduct(useBigFuseBox ? 'VXFH12' : 'VXFH6')!, 1, 'shield',
    useBigFuseBox ? 'Zekeringkast 12-weg voor al je circuits.' : 'Compacte zekeringkast voor eenvoudige setups.');

  // 8. Blade fuse pack (always)
  addItem(items, getProduct('VXFUSEPACK')!, 1, 'shield',
    'Assortiment blade fuses voor je zekeringkast.');

  // 9. Alternator cable (starter → converter DC-DC input)
  const altRoute = cableRoutes?.find(r => r.route_id === 'starter_to_leisure');
  const altMeters = Math.ceil(Number(altRoute?.distance_meters ?? 3) + 1);
  // Note: 16mm² battery cables are included with the converter
  // But we need cables for the alternator run
  const altCableRed = getProduct('VXCAB16R');
  const altCableBlk = getProduct('VXCAB16Z');
  if (altCableRed && altCableBlk) {
    addItem(items, altCableRed, altMeters, 'cable',
      `${altMeters}m kabel voor starterbatterij → converter (Anderson connector).`, true);
    addItem(items, altCableBlk, altMeters, 'cable',
      `${altMeters}m negatieve kabel voor alternator circuit.`, true);
  }

  // 10. Heatshrink (always)
  addItem(items, getProduct('VXKRIMP')!, 1, 'cable');

  // 11. Cable ties (always)
  addItem(items, getProduct('VXBINDERS')!, 1, 'cable');

  // 12. Ring terminals (always)
  addItem(items, getProduct('VXRINGPACK')!, 1, 'cable');

  // 13. Switch panel (if > 3 appliances)
  if (state.selectedAppliances.length > 3) {
    addItem(items, getProduct('VXPANEL5')!, 1, 'gauge');
  }

  // 14. 230V outlets (converter always has AC OUT)
  addItem(items, getProduct('VXPLUG230')!, 1, 'plug');

  // 15. USB outlets (if USB appliances or always useful)
  const hasUSBAppliances = state.selectedAppliances.some(sa => {
    const a = appliances.find(ap => ap.id === sa.id);
    return a && !a.requires_inverter && (a.name.toLowerCase().includes('usb') || a.name.toLowerCase().includes('phone') || a.name.toLowerCase().includes('telefoon'));
  });
  if (hasUSBAppliances || state.selectedAppliances.length > 2) {
    addItem(items, getProduct('VXUSB2')!, 1, 'plug');
  }

  // 16. Battery monitor shunt (if >= 100Ah)
  if (batteryAh >= 100) {
    addItem(items, getProduct('VXSHUNT')!, 1, 'activity');
  }

  // 17. CEE-16A shore power inlet (if regular or fulltime)
  if (state.usageType === 'regular' || state.usageType === 'fulltime') {
    addItem(items, getProduct('VXCEE16')!, 1, 'plug',
      'Walstroom aansluiting — sluit aan op AC IN van je VanXcel Converter voor laden op campings.');
  }

  // Calculate totals
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalInStock = items.filter(i => i.inStock).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalComingSoon = items.filter(i => i.comingSoon).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalOutOfStock = items.filter(i => !i.inStock && !i.comingSoon).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const savingsHighlight = `De VanXcel 5-in-1 Converter vervangt een losse omvormer (€399), DC-DC lader (€299), MPPT regelaar (€129) en walstroomlader (€149) — een besparing van meer dan €500!`;

  return {
    items,
    batteryAh,
    solarWp,
    converterW,
    dcDcA: 25, // fixed, built into converter
    totalPrice,
    totalInStock,
    totalComingSoon,
    totalOutOfStock,
    daysAutark,
    converterProduct: converterSel.product,
    batteryProduct: batterySel.product,
    converterWarning: converterSel.warning,
    solarWarning: solarSel.warning,
    savingsHighlight,
  };
}
