import type { Tables } from "@/integrations/supabase/types";
import type { SelectedAppliance } from "@/components/configurator/StepAppliances";
import { vanxcelProducts, type VanXcelProduct } from "./vanxcel-products";

type Appliance = Tables<"appliances">;

export function getDaysAutark(usageType: string): number {
  const map: Record<string, number> = { weekend: 2, regular: 3, fulltime: 2, stealth: 1 };
  return map[usageType] ?? 2;
}

export function getSunHours(climate: string): number {
  const map: Record<string, number> = { benelux: 3.5, southern_europe: 5, scandinavia: 2.5, all_season: 3 };
  return map[climate] ?? 3;
}

export function getDailySolarYield(wp: number, climate: string): number {
  return Math.round(wp * getSunHours(climate) * 0.85);
}

export function calculateBattery(totalDailyWh: number, usageType: string): number {
  const days = getDaysAutark(usageType);
  const safetyMargin = 1.25;
  const dodLiFePO4 = 0.8;
  const rawAh = (totalDailyWh * days * safetyMargin) / (12 * dodLiFePO4);
  const sizes = [50, 100, 200, 300, 400];
  return sizes.find((s) => s >= rawAh) || 400;
}

export function calculateSolar(totalDailyWh: number, climate: string, maxSolarM2: number): number {
  const sunHours = getSunHours(climate);
  const efficiency = 0.85;
  const wpPerM2 = 180;
  const neededWp = totalDailyWh / sunHours / efficiency;
  const maxWp = (maxSolarM2 || 999) * wpPerM2;
  const cappedWp = Math.min(neededWp, maxWp);
  return Math.ceil(cappedWp / 100) * 100;
}

export function get230vStats(
  selectedAppliances: SelectedAppliance[],
  allAppliances: Appliance[]
) {
  const active = selectedAppliances
    .map((sa) => allAppliances.find((a) => a.id === sa.id))
    .filter((a): a is Appliance => !!a && !!a.requires_inverter);
  return {
    count: active.length,
    peakW: active.reduce((sum, a) => sum + (a.wattage_peak ?? a.wattage_typical), 0),
  };
}

// === VanXcel Product Selectors ===

export interface ConverterSelection {
  product: VanXcelProduct;
  warning: string | null;
  warningParams?: Record<string, number>;
  exceeds: boolean;
}

export function selectConverter(maxPeak230V: number, has230Vappliances: boolean): ConverterSelection {
  // Converter is ALWAYS needed (DC-DC + MPPT are built in)
  if (!has230Vappliances || maxPeak230V <= 1000) {
    return { product: vanxcelProducts.find(p => p.sku === 'VX1000CV')!, warning: null, exceeds: false };
  } else if (maxPeak230V <= 1500) {
    return { product: vanxcelProducts.find(p => p.sku === 'VX1500CV')!, warning: null, exceeds: false };
  } else {
    return {
      product: vanxcelProducts.find(p => p.sku === 'VX1500CV')!,
      warning: 'configurator.converterWarningText',
      warningParams: { peakW: maxPeak230V },
      exceeds: true,
    };
  }
}

export interface BatterySelection {
  product: VanXcelProduct;
  quantity: number;
}

export function selectBatteryProduct(requiredAh: number): BatterySelection {
  if (requiredAh <= 100) {
    return { product: vanxcelProducts.find(p => p.sku === 'VXBAT100S')!, quantity: 1 };
  } else if (requiredAh <= 200) {
    return { product: vanxcelProducts.find(p => p.sku === 'VXBAT200')!, quantity: 1 };
  } else if (requiredAh <= 300) {
    return { product: vanxcelProducts.find(p => p.sku === 'VXBAT300')!, quantity: 1 };
  } else {
    return { product: vanxcelProducts.find(p => p.sku === 'VXBAT200')!, quantity: Math.ceil(requiredAh / 200) };
  }
}

export interface SolarSelection {
  product: VanXcelProduct;
  quantity: number;
  cappedWp: number;
  warning: string | null;
  warningParams?: Record<string, number>;
}

export function selectSolarProduct(requiredWp: number): SolarSelection {
  const cappedWp = Math.min(requiredWp, 500);
  const warning = requiredWp > 500 ? 'configurator.solarWarningText' : null;
  const warningParams = requiredWp > 500 ? { requiredWp } : undefined;

  const panel200 = vanxcelProducts.find(p => p.sku === 'VXSOL200')!;
  const panelWp = 200;
  const quantity = Math.ceil(cappedWp / panelWp);

  return { product: panel200, quantity, cappedWp: quantity * panelWp, warning, warningParams };
}

export function selectANLFuse(converterSku: string): VanXcelProduct {
  const converter = vanxcelProducts.find(p => p.sku === converterSku);
  const fuseRequired = Number(converter?.specs.fuseRequired ?? 200);
  if (fuseRequired >= 250) {
    return vanxcelProducts.find(p => p.sku === 'VXANL250')!;
  }
  return vanxcelProducts.find(p => p.sku === 'VXANL200')!;
}
