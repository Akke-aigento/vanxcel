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
  reasonVars?: Record<string, string | number>;
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
  isPerMeter?: boolean,
  priceOverrides?: Map<string, number>,
  reasonVars?: Record<string, string | number>
) {
  // Coming-soon products get price 0 (hidden in UI)
  // Otherwise use live price from SellQo, or fallback to hardcoded
  let unitPrice = product.price;
  if (product.comingSoon) {
    unitPrice = 0;
  } else if (priceOverrides?.has(product.sku)) {
    unitPrice = priceOverrides.get(product.sku)!;
  }

  items.push({
    category: product.category,
    name: product.name,
    specs: Object.entries(product.specs)
      .filter(([k]) => !['type', 'priceUnit'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 3)
      .join(', '),
    quantity,
    unitPrice,
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
  cableRoutes?: Tables<"vehicle_cable_routes">[] | null,
  priceOverrides?: Map<string, number>
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
    'configurator.pr_converter',
    false, priceOverrides);

  // 2. Battery
  addItem(items, batterySel.product, batterySel.quantity, 'battery',
    'configurator.pr_battery',
    false, priceOverrides);

  // 3. Solar panels (if needed)
  if (solarWp > 0) {
    addItem(items, solarSel.product, solarSel.quantity, 'sun',
      'configurator.pr_solar',
      false, priceOverrides);

    // Roof cable gland
    addItem(items, getProduct('VXDAKDV')!, 1, 'cable',
      'configurator.pr_roofGland', false, priceOverrides);

    // Solar mounting kit
    addItem(items, getProduct('VXSOLMOUNT')!, 1, 'cable',
      'configurator.pr_solarMount', false, priceOverrides);

    // Solar cables (6mm²) — estimate route length
    const solarRoute = cableRoutes?.find(r => r.route_id === 'roof_to_interior');
    const solarMeters = Math.ceil(Number(solarRoute?.distance_meters ?? 4) + 1);
    addItem(items, getProduct('VXCAB6SR')!, solarMeters, 'cable',
      'configurator.pr_solarCableRed', true, priceOverrides);
    addItem(items, getProduct('VXCAB6SZ')!, solarMeters, 'cable',
      'configurator.pr_solarCableBlk', true, priceOverrides);
  }

  // 4. ANL Fuse (always)
  addItem(items, anlFuse, 1, 'shield',
    'configurator.pr_anlFuse',
    false, priceOverrides);

  // 5. Battery disconnect switch (always)
  addItem(items, getProduct('VXSWITCH200')!, 1, 'power',
    'configurator.pr_batterySwitch',
    false, priceOverrides);

  // 6. Negative busbar (always)
  addItem(items, getProduct('VXBUSBAR')!, 1, 'minus',
    'configurator.pr_busbar',
    false, priceOverrides);

  // 7. Fuse box (12-slot for regular/fulltime, 6-slot for weekend/stealth)
  const useBigFuseBox = state.usageType === 'regular' || state.usageType === 'fulltime';
  addItem(items, getProduct(useBigFuseBox ? 'VXFH12' : 'VXFH6')!, 1, 'shield',
    useBigFuseBox ? 'configurator.pr_fuseBox12' : 'configurator.pr_fuseBox6',
    false, priceOverrides);

  // 8. Blade fuse pack (always)
  addItem(items, getProduct('VXFUSEPACK')!, 1, 'shield',
    'configurator.pr_bladeFuses', false, priceOverrides);

  // 9. Alternator cable (starter → converter DC-DC input)
  const altRoute = cableRoutes?.find(r => r.route_id === 'starter_to_leisure');
  const altMeters = Math.ceil(Number(altRoute?.distance_meters ?? 3) + 1);
  const altCableRed = getProduct('VXCAB16R');
  const altCableBlk = getProduct('VXCAB16Z');
  if (altCableRed && altCableBlk) {
    addItem(items, altCableRed, altMeters, 'cable',
      'configurator.pr_altCableRed', true, priceOverrides);
    addItem(items, altCableBlk, altMeters, 'cable',
      'configurator.pr_altCableBlk', true, priceOverrides);
  }

  // 10. Heatshrink (always)
  addItem(items, getProduct('VXKRIMP')!, 1, 'cable', undefined, false, priceOverrides);

  // 11. Cable ties (always)
  addItem(items, getProduct('VXBINDERS')!, 1, 'cable', undefined, false, priceOverrides);

  // 12. Ring terminals (always)
  addItem(items, getProduct('VXRINGPACK')!, 1, 'cable', undefined, false, priceOverrides);

  // 13. Switch panel (if > 3 appliances)
  if (state.selectedAppliances.length > 3) {
    addItem(items, getProduct('VXPANEL5')!, 1, 'gauge', undefined, false, priceOverrides);
  }

  // 14. 230V outlets (converter always has AC OUT)
  addItem(items, getProduct('VXPLUG230')!, 1, 'plug', undefined, false, priceOverrides);

  // 15. USB outlets (if USB appliances or always useful)
  const hasUSBAppliances = state.selectedAppliances.some(sa => {
    const a = appliances.find(ap => ap.id === sa.id);
    return a && !a.requires_inverter && (a.name.toLowerCase().includes('usb') || a.name.toLowerCase().includes('phone') || a.name.toLowerCase().includes('telefoon'));
  });
  if (hasUSBAppliances || state.selectedAppliances.length > 2) {
    addItem(items, getProduct('VXUSB2')!, 1, 'plug', undefined, false, priceOverrides);
  }

  // 16. Battery monitor shunt (if >= 100Ah)
  if (batteryAh >= 100) {
    addItem(items, getProduct('VXSHUNT')!, 1, 'activity', undefined, false, priceOverrides);
  }

  // 17. CEE-16A shore power inlet (if regular or fulltime)
  if (state.usageType === 'regular' || state.usageType === 'fulltime') {
    addItem(items, getProduct('VXCEE16')!, 1, 'plug',
      'configurator.pr_shoreInlet',
      false, priceOverrides);
  }

  // Calculate totals
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalInStock = items.filter(i => i.inStock).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalComingSoon = items.filter(i => i.comingSoon).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalOutOfStock = items.filter(i => !i.inStock && !i.comingSoon).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const savingsHighlight = 'configurator.savingsHighlightText';

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
