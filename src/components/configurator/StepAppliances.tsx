import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getLocalized, getLangFromI18n } from "@/lib/configurator-i18n";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Thermometer,
  UtensilsCrossed,
  Lightbulb,
  Sofa,
  Laptop,
  ShieldCheck,
  Droplets,
  Refrigerator,
  Flame,
  Fan,
  Plug,
  Usb,
  Smartphone,
  Video,
  AlertTriangle,
  Bath,
  SatelliteDish,
  LampDesk,
  Sun,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Appliance = Tables<"appliances">;

interface Props {
  usageType: string | null;
  onComplete: (appliances: SelectedAppliance[], totalWh: number) => void;
  onBack: () => void;
}

export interface SelectedAppliance {
  id: string;
  hours: number;
  wh: number;
}

const CATEGORY_ORDER = [
  "koeling",
  "verwarming",
  "keuken",
  "verlichting",
  "comfort",
  "werk",
  "veiligheid",
  "water",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  koeling: <Refrigerator className="w-5 h-5" />,
  verwarming: <Thermometer className="w-5 h-5" />,
  keuken: <UtensilsCrossed className="w-5 h-5" />,
  verlichting: <Lightbulb className="w-5 h-5" />,
  comfort: <Sofa className="w-5 h-5" />,
  werk: <Laptop className="w-5 h-5" />,
  veiligheid: <ShieldCheck className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
};

const ICON_MAP: Record<string, React.ReactNode> = {
  refrigerator: <Refrigerator className="w-4 h-4" />,
  thermometer: <Thermometer className="w-4 h-4" />,
  flame: <Flame className="w-4 h-4" />,
  fan: <Fan className="w-4 h-4" />,
  "lamp-desk": <LampDesk className="w-4 h-4" />,
  lightbulb: <Lightbulb className="w-4 h-4" />,
  plug: <Plug className="w-4 h-4" />,
  usb: <Usb className="w-4 h-4" />,
  smartphone: <Smartphone className="w-4 h-4" />,
  laptop: <Laptop className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  "alert-triangle": <AlertTriangle className="w-4 h-4" />,
  bath: <Bath className="w-4 h-4" />,
  "satellite-dish": <SatelliteDish className="w-4 h-4" />,
  droplets: <Droplets className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  sofa: <Sofa className="w-4 h-4" />,
};

const PRESELECTION: Record<string, string[]> = {
  weekend: [
    "Cooler box 12V",
    "LED strip lighting",
    "USB charging ports",
    "Smartphone charging",
  ],
  regular: [
    "Compressor fridge 40L",
    "LED strip lighting",
    "LED spot lights",
    "USB charging ports",
    "Smartphone charging",
    "Laptop charging",
    "Water pump",
    "Roof fan / ventilator",
    "Diesel heater 2kW",
  ],
  fulltime: [
    "Compressor fridge 60L",
    "LED strip lighting",
    "LED spot lights",
    "USB charging ports",
    "Smartphone charging",
    "Laptop charging",
    "Water pump",
    "Roof fan / ventilator",
    "Diesel heater 2kW",
    "Induction cooktop 1-ring",
    "Hot water boiler 10L",
    "CO detector",
    "Reading light",
  ],
  stealth: [
    "USB charging ports",
    "Smartphone charging",
    "LED strip lighting",
  ],
};

type ApplianceState = Record<string, { enabled: boolean; hours: number }>;

const StepAppliances = ({ usageType, onComplete, onBack }: Props) => {
  const { t, i18n } = useTranslation();
  const lang = getLangFromI18n(i18n.language);
  const [appState, setAppState] = useState<ApplianceState>({});
  const [initialized, setInitialized] = useState(false);

  const { data: appliances, isLoading } = useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appliances")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Initialize state with preselection
  useEffect(() => {
    if (!appliances || initialized) return;
    const preselect = usageType ? PRESELECTION[usageType] || [] : [];
    const initial: ApplianceState = {};
    appliances.forEach((a) => {
      const isPreselected = preselect.includes(a.name);
      initial[a.id] = {
        enabled: isPreselected,
        hours: a.daily_hours_typical ?? 1,
      };
    });
    setAppState(initial);
    setInitialized(true);
  }, [appliances, usageType, initialized]);

  const toggle = useCallback((id: string) => {
    setAppState((s) => ({
      ...s,
      [id]: { ...s[id], enabled: !s[id].enabled },
    }));
  }, []);

  const setHours = useCallback((id: string, hours: number) => {
    setAppState((s) => ({
      ...s,
      [id]: { ...s[id], hours },
    }));
  }, []);

  // Group by category
  const grouped = useMemo(() => {
    if (!appliances) return [];
    const map = new Map<string, Appliance[]>();
    appliances.forEach((a) => {
      const arr = map.get(a.category) || [];
      arr.push(a);
      map.set(a.category, arr);
    });
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [appliances]);

  // Calculations
  const stats = useMemo(() => {
    if (!appliances) return { total: 0, wh12v: 0, wh230v: 0, count230v: 0, peak230v: 0 };
    let total = 0, wh12v = 0, wh230v = 0, count230v = 0, peak230v = 0;
    appliances.forEach((a) => {
      const s = appState[a.id];
      if (!s?.enabled) return;
      const wh = a.wattage_typical * s.hours;
      total += wh;
      if (a.requires_inverter) {
        wh230v += wh;
        count230v++;
        peak230v += a.wattage_peak ?? a.wattage_typical;
      } else {
        wh12v += wh;
      }
    });
    return { total: Math.round(total), wh12v: Math.round(wh12v), wh230v: Math.round(wh230v), count230v, peak230v };
  }, [appliances, appState]);

  const handleNext = () => {
    if (!appliances) return;
    const selected: SelectedAppliance[] = [];
    appliances.forEach((a) => {
      const s = appState[a.id];
      if (s?.enabled) {
        selected.push({ id: a.id, hours: s.hours, wh: Math.round(a.wattage_typical * s.hours) });
      }
    });
    onComplete(selected, stats.total);
  };

  // Which categories have active items (for default open accordion)
  const activeCategories = useMemo(() => {
    if (!appliances) return [];
    const cats = new Set<string>();
    appliances.forEach((a) => {
      if (appState[a.id]?.enabled) cats.add(a.category);
    });
    return Array.from(cats);
  }, [appliances, appState]);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">{t("configurator.loading")}</div>;
  }

  const categoryKeys: Record<string, string> = {
    koeling: "configurator.catCooling",
    verwarming: "configurator.catHeating",
    keuken: "configurator.catKitchen",
    verlichting: "configurator.catLighting",
    comfort: "configurator.catComfort",
    werk: "configurator.catWork",
    veiligheid: "configurator.catSafety",
    water: "configurator.catWater",
  };

  return (
    <div className="pb-36">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("configurator.back")}
      </button>

      <h2 className="text-2xl font-bold tracking-tight mb-1">
        {t("configurator.appliancesTitle")}
      </h2>
      <p className="text-muted-foreground mb-6">
        {t("configurator.appliancesSubtitle")}
      </p>

      <Accordion
        type="multiple"
        defaultValue={activeCategories.length > 0 ? activeCategories : CATEGORY_ORDER}
        className="space-y-2"
      >
        {grouped.map(({ category, items }) => (
          <AccordionItem key={category} value={category} className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold">
                {CATEGORY_ICONS[category]}
                {t(categoryKeys[category])}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {items.filter((i) => appState[i.id]?.enabled).length}/{items.length}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-3">
                {items.map((item) => {
                  const s = appState[item.id];
                  const enabled = s?.enabled ?? false;
                  const hours = s?.hours ?? item.daily_hours_typical ?? 1;
                  const wh = Math.round(item.wattage_typical * hours);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        enabled ? "border-primary/50 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-muted-foreground shrink-0">
                            {ICON_MAP[item.icon ?? ""] ?? <Zap className="w-4 h-4" />}
                          </span>
                          <span className="font-medium truncate">{item.name_nl}</span>
                          {item.requires_inverter && (
                            <Badge variant="outline" className="text-xs shrink-0 border-orange-500/50 text-orange-400">
                              230V
                            </Badge>
                          )}
                          {item.is_essential && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {t("configurator.recommended")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {enabled && (
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {wh} Wh
                            </span>
                          )}
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => toggle(item.id)}
                          />
                        </div>
                      </div>

                      {enabled && (
                        <div className="mt-3 flex items-center gap-3 pl-6">
                          <span className="text-xs text-muted-foreground whitespace-nowrap w-20">
                            {hours}h / {t("configurator.day")}
                          </span>
                          <Slider
                            value={[hours]}
                            onValueChange={([v]) => setHours(item.id, v)}
                            min={0.5}
                            max={24}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-primary whitespace-nowrap">
                            {item.wattage_typical}W × {hours}h
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-bold text-lg text-primary">
                {stats.total} Wh/{t("configurator.day")}
              </span>
              <span className="text-muted-foreground">
                12V: {stats.wh12v} Wh
              </span>
              <span className="text-muted-foreground">
                230V: {stats.wh230v} Wh
              </span>
              {stats.count230v > 0 && (
                <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                  <Zap className="w-3 h-3 mr-1" />
                  {t("configurator.inverterNeeded")} · {stats.peak230v}W max
                </Badge>
              )}
            </div>
            <Button size="lg" className="btn-shimmer gap-2 shrink-0" onClick={handleNext}>
              {t("configurator.nextStep")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepAppliances;
