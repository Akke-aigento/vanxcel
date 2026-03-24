import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Battery,
  Sun,
  Zap,
  Plug,
  Cable,
  Shield,
  Activity,
  Gauge,
  ShoppingCart,
  Save,
  FileDown,
  Plus,
  Minus,
} from "lucide-react";
import type { ConfiguratorState } from "./ConfiguratorWizard";
import { generatePackage, type PackageItem } from "@/lib/configurator-package";

interface Props {
  state: ConfiguratorState;
  onBack: () => void;
  onNext?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  battery: <Battery className="w-5 h-5" />,
  sun: <Sun className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  plug: <Plug className="w-5 h-5" />,
  cable: <Cable className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  battery: "text-green-500",
  solar: "text-yellow-500",
  inverter: "text-blue-500",
  dc_dc: "text-orange-500",
  cable: "text-muted-foreground",
  fuse: "text-muted-foreground",
  accessory: "text-purple-500",
};

const categoryLabels: Record<string, string> = {
  battery: "packageCatBattery",
  solar: "packageCatSolar",
  inverter: "packageCatInverter",
  dc_dc: "packageCatDcDc",
  cable: "packageCatCable",
  fuse: "packageCatFuse",
  accessory: "packageCatAccessory",
};

const StepPackage = ({ state, onBack, onNext }: Props) => {
  const { t } = useTranslation();

  const { data: appliances } = useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appliances").select("*");
      if (error) throw error;
      return data;
    },
  });

  const pkg = useMemo(() => {
    if (!appliances) return null;
    return generatePackage(state, appliances);
  }, [appliances, state]);

  const [quantities, setQuantities] = useState<Record<number, number>>({});

  if (!pkg) {
    return <div className="text-center py-12 text-muted-foreground">Laden...</div>;
  }

  const getQty = (idx: number) => quantities[idx] ?? pkg.items[idx].quantity;
  const adjustQty = (idx: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [idx]: Math.max(1, (prev[idx] ?? pkg.items[idx].quantity) + delta),
    }));
  };

  const totalPrice = pkg.items.reduce(
    (sum, item, idx) => sum + item.unitPrice * getQty(idx),
    0
  );

  // Group items by category
  const grouped = pkg.items.reduce<Record<string, { item: PackageItem; idx: number }[]>>(
    (acc, item, idx) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({ item, idx });
      return acc;
    },
    {}
  );

  const categoryOrder = ["battery", "solar", "inverter", "dc_dc", "cable", "fuse", "accessory"];

  return (
    <div className="pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("configurator.back")}
      </button>

      <h2 className="text-2xl font-bold tracking-tight mb-1">
        {t("configurator.packageTitle")}
      </h2>
      <p className="text-muted-foreground mb-6">
        {t("configurator.packageSubtitle", {
          vehicle: `${state.brand ?? ""} ${state.vehicle?.model ?? ""} ${state.vehicle?.generation ?? ""}`.trim(),
        })}
      </p>

      {/* Summary header */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("configurator.totalItems")}</p>
            <p className="text-lg font-bold">
              {pkg.items.reduce((sum, _, idx) => sum + getQty(idx), 0)} {t("configurator.items")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("configurator.totalPrice")}</p>
            <p className="text-3xl font-bold tracking-tight">€{totalPrice.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Product list by category */}
      <div className="space-y-6 mb-8">
        {categoryOrder.map((cat) => {
          const group = grouped[cat];
          if (!group) return null;
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {t(`configurator.${categoryLabels[cat]}`)}
              </h3>
              <div className="space-y-3">
                {group.map(({ item, idx }) => (
                  <Card
                    key={idx}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`mt-1 ${categoryColors[item.category]}`}>
                        {iconMap[item.icon] ?? <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.specs}</p>
                        <p className="text-xs text-primary italic mt-1">{item.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="font-bold">€{item.unitPrice * getQty(idx)}</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustQty(idx, -1)}
                            className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {getQty(idx)}
                          </span>
                          <button
                            onClick={() => adjustQty(idx, 1)}
                            className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {getQty(idx) > 1 && (
                          <p className="text-xs text-muted-foreground">
                            €{item.unitPrice} × {getQty(idx)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* System summary sidebar */}
      <Card className="mb-8 bg-secondary/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("configurator.systemSummary")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">{t("configurator.batteryTitle")}</span>
            <span className="font-semibold text-right">{pkg.batteryAh} Ah LiFePO4</span>
            <span className="text-muted-foreground">{t("configurator.solarTitle")}</span>
            <span className="font-semibold text-right">{pkg.solarWp} Wp</span>
            <span className="text-muted-foreground">{t("configurator.inverterTitle")}</span>
            <span className="font-semibold text-right">
              {pkg.inverterW > 0 ? `${pkg.inverterW}W` : "—"}
            </span>
            <span className="text-muted-foreground">{t("configurator.dcDcTitle")}</span>
            <span className="font-semibold text-right">{pkg.dcDcA}A</span>
            <span className="text-muted-foreground">{t("configurator.day")}verbruik</span>
            <span className="font-semibold text-right">{state.totalDailyWh} Wh</span>
            <span className="text-muted-foreground">{t("configurator.estimatedAutarky")}</span>
            <span className="font-semibold text-right">
              {pkg.daysAutark} {t("configurator.daysAutark")}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold">{t("configurator.totalPrice")}</span>
            <span className="text-2xl font-bold">€{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="btn-shimmer gap-2 flex-1"
          onClick={() => toast.info(t("configurator.comingSoon"))}
        >
          <ShoppingCart className="w-5 h-5" />
          {t("configurator.addAllToCart")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={() => toast.info(t("configurator.comingSoon"))}
        >
          <Save className="w-4 h-4" />
          {t("configurator.saveConfig")}
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="gap-2"
          onClick={() => toast.info(t("configurator.comingSoon"))}
        >
          <FileDown className="w-4 h-4" />
          {t("configurator.downloadPdf")}
        </Button>
      </div>

      {onNext && (
        <div className="mt-8 text-center">
          <Button size="lg" className="btn-shimmer gap-2" onClick={onNext}>
            {t("configurator.nextStep")}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StepPackage;
