import type { ConfiguratorState } from "@/components/configurator/ConfiguratorWizard";
import type { Tables } from "@/integrations/supabase/types";
import {
  calculateBattery,
  calculateSolar,
  calculateInverter,
  calculateDcDc,
  getDaysAutark,
  getDailySolarYield,
  get230vStats,
} from "./configurator-calculations";

export interface PackageItem {
  category: string;
  name: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  icon: string;
}

export interface PackageResult {
  items: PackageItem[];
  batteryAh: number;
  solarWp: number;
  inverterW: number;
  dcDcA: number;
  totalPrice: number;
  daysAutark: number;
}

export function generatePackage(
  state: ConfiguratorState,
  appliances: Tables<"appliances">[]
): PackageResult {
  const batteryAh = calculateBattery(state.totalDailyWh, state.usageType ?? "regular");
  const maxSolarM2 = state.bodyType?.solar_max_area_m2
    ? Number(state.bodyType.solar_max_area_m2)
    : 4;
  const solarWp = calculateSolar(state.totalDailyWh, state.climate ?? "benelux", maxSolarM2);
  const inverterW = calculateInverter(state.selectedAppliances, appliances);
  const dcDcA = calculateDcDc(state.motorisation, batteryAh);
  const daysAutark = getDaysAutark(state.usageType ?? "regular");
  const stats230v = get230vStats(state.selectedAppliances, appliances);
  const solarYield = getDailySolarYield(solarWp, state.climate ?? "benelux");

  const items: PackageItem[] = [];

  // Battery
  const batteryQty = batteryAh > 200 ? Math.ceil(batteryAh / 200) : 1;
  const batteryUnitAh = batteryAh > 200 ? 200 : batteryAh;
  const batteryPrice = batteryUnitAh <= 100 ? 349 : 599;
  items.push({
    category: "battery",
    name: `LiFePO4 ${batteryUnitAh}Ah`,
    specs: "12.8V, ingebouwde BMS, bluetooth monitoring",
    quantity: batteryQty,
    unitPrice: batteryPrice,
    reason: `${batteryAh}Ah voor ${state.totalDailyWh}Wh dagelijks verbruik`,
    icon: "battery",
  });

  // Solar panels
  if (solarWp > 0) {
    const panelWp = 200;
    const panelCount = Math.ceil(solarWp / panelWp);
    items.push({
      category: "solar",
      name: `${panelWp}W Mono`,
      specs: "Monocrystalline, aluminium frame, MC4 connectors",
      quantity: panelCount,
      unitPrice: 149,
      reason: `${panelCount}× ${panelWp}W = ${panelCount * panelWp}Wp — ${solarYield} Wh/dag`,
      icon: "sun",
    });

    // MPPT controller
    const mpptAmps = Math.ceil((solarWp / 12) * 1.2);
    const mpptSize = [10, 20, 30, 40, 50].find((s) => s >= mpptAmps) || 50;
    const mpptPrice = mpptSize <= 20 ? 89 : mpptSize <= 30 ? 129 : 179;
    items.push({
      category: "solar",
      name: `MPPT ${mpptSize}A`,
      specs: "MPPT technologie, bluetooth, programmeerbaar",
      quantity: 1,
      unitPrice: mpptPrice,
      reason: `Regelt de ${solarWp}Wp zonnepanelen`,
      icon: "gauge",
    });
  }

  // Inverter
  if (inverterW > 0) {
    const invPrice =
      inverterW <= 600 ? 149 : inverterW <= 1000 ? 249 : inverterW <= 2000 ? 399 : 599;
    items.push({
      category: "inverter",
      name: `${inverterW}W Pure Sine Wave`,
      specs: "12V → 230V, pure sinus, USB poorten",
      quantity: 1,
      unitPrice: invPrice,
      reason: `Voor ${stats230v.count} apparaten op 230V (piek ${stats230v.peakW}W)`,
      icon: "zap",
    });
  }

  // DC-DC charger
  const dcDcPrice = dcDcA <= 30 ? 199 : dcDcA <= 50 ? 299 : 399;
  const isSmartAlt = state.motorisation?.has_smart_alternator;
  items.push({
    category: "dc_dc",
    name: `DC-DC ${dcDcA}A`,
    specs: "12V→12V, smart alternator compatible, MPPT input",
    quantity: 1,
    unitPrice: dcDcPrice,
    reason: isSmartAlt
      ? "VERPLICHT — smart alternator gedetecteerd"
      : "Aanbevolen voor optimale lading via alternator",
    icon: "plug",
  });

  // Wiring kit
  items.push({
    category: "cable",
    name: "Bekabelingspakket",
    specs: "Hoofdkabels, zekeringen, kabelschoenen, krimpkous",
    quantity: 1,
    unitPrice: 149,
    reason: "Alle kabels voor de hoofdcircuits",
    icon: "cable",
  });

  // Fuse box
  items.push({
    category: "fuse",
    name: "Zekeringkast 12-weg",
    specs: "ATC/ATO zekeringen, negatieve busbar, LED indicatie",
    quantity: 1,
    unitPrice: 49,
    reason: "Verdeelt en beveiligt al je 12V circuits",
    icon: "shield",
  });

  // Battery monitor
  if (batteryAh >= 100) {
    items.push({
      category: "accessory",
      name: "Battery Monitor (SmartShunt)",
      specs: "500A shunt, bluetooth, SOC percentage",
      quantity: 1,
      unitPrice: 79,
      reason: "Houdt je batterijstatus bij — cruciaal voor LiFePO4",
      icon: "activity",
    });
  }

  // ANL fuse + holder — sizing based on main cable thickness
  const mainCableSize = inverterW > 2000 ? 50 : inverterW > 1000 ? 35 : 25;
  const anlFuseA = mainCableSize >= 50 ? 300 : mainCableSize >= 35 ? 200 : 150;
  const anlFusePrice = anlFuseA >= 300 ? 18 : 15;
  items.push({
    category: "fuse",
    name: `ANL Fuse ${anlFuseA}A + Holder`,
    specs: `${anlFuseA}A ANL zekering met inline houder`,
    quantity: 1,
    unitPrice: anlFusePrice,
    reason: "VERPLICHT — beschermt tegen kortsluiting. Plaatsen binnen 18cm van de batterij positieve klem.",
    icon: "shield",
  });

  // Battery disconnect switch
  items.push({
    category: "safety",
    name: "Battery Disconnect Switch",
    specs: "300A rated, sleutelschakelaar",
    quantity: 1,
    unitPrice: 25,
    reason: "Noodschakelaar — schakelt het volledige systeem uit. Plaatsen direct NA de hoofdzekering.",
    icon: "power",
  });

  // Negative busbar
  items.push({
    category: "cable",
    name: "Negatieve Busbar (6-weg)",
    specs: "M8 aansluitingen, 250A rated",
    quantity: 1,
    unitPrice: 15,
    reason: "Centraal punt voor alle negatieve kabels. Verbind met 25mm²+ kabel naar chassis-aarding.",
    icon: "minus",
  });

  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return { items, batteryAh, solarWp, inverterW, dcDcA, totalPrice, daysAutark };
}
