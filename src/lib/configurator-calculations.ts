import type { Tables } from "@/integrations/supabase/types";
import type { SelectedAppliance } from "@/components/configurator/StepAppliances";

type Appliance = Tables<"appliances">;
type Motorisation = Tables<"vehicle_motorisations">;

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

export function calculateInverter(
  selectedAppliances: SelectedAppliance[],
  allAppliances: Appliance[]
): number {
  const active230v = selectedAppliances
    .map((sa) => allAppliances.find((a) => a.id === sa.id))
    .filter((a): a is Appliance => !!a && !!a.requires_inverter);

  if (active230v.length === 0) return 0;

  const maxPeakW = active230v.reduce((sum, a) => sum + (a.wattage_peak ?? a.wattage_typical), 0);
  const withMargin = maxPeakW * 1.2;
  const sizes = [300, 600, 1000, 1500, 2000, 3000];
  return sizes.find((s) => s >= withMargin) || 3000;
}

export function calculateDcDc(motorisation: Motorisation | null, batteryAh: number): number {
  if (!motorisation) return 30;
  const altAmps = motorisation.alternator_rated_amps ?? 150;
  const maxFromAlt = motorisation.has_smart_alternator ? altAmps * 0.3 : altAmps * 0.4;
  const maxFromBattery = batteryAh * 0.25;
  const ideal = Math.min(maxFromAlt, maxFromBattery);
  const sizes = [20, 30, 50, 60];
  return sizes.find((s) => s >= ideal) || 60;
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
