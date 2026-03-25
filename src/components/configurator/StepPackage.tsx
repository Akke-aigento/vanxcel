import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVanXcelPrices } from "@/hooks/use-vanxcel-prices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
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
  Power,
  Bell,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { ConfiguratorState } from "./ConfiguratorWizard";
import { useCableRoutes } from "@/hooks/use-configurator";
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
  power: <Power className="w-5 h-5" />,
  minus: <Minus className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  converter: "text-[#008593]",
  battery: "text-green-500",
  solar: "text-yellow-500",
  cable: "text-muted-foreground",
  fuse: "text-muted-foreground",
  safety: "text-red-500",
  panel: "text-purple-500",
  accessory: "text-purple-500",
};

const categoryLabels: Record<string, string> = {
  converter: "packageCatConverter",
  battery: "packageCatBattery",
  solar: "packageCatSolar",
  cable: "packageCatCable",
  fuse: "packageCatFuse",
  safety: "packageCatSafety",
  panel: "packageCatPanel",
  accessory: "packageCatAccessory",
};

const StepPackage = ({ state, onBack, onNext }: Props) => {
  const { t } = useTranslation();
  const [notifyEmails, setNotifyEmails] = useState<Record<string, string>>({});
  const [notifyOpen, setNotifyOpen] = useState<Record<string, boolean>>({});
  const [notifySubmitted, setNotifySubmitted] = useState<Record<string, boolean>>({});

  const { data: appliances } = useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appliances").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: cableRoutes } = useCableRoutes(state.vehicleId);
  const { priceMap } = useVanXcelPrices();

  const pkg = useMemo(() => {
    if (!appliances) return null;
    return generatePackage(state, appliances, cableRoutes, priceMap);
  }, [appliances, state, cableRoutes, priceMap]);

  if (!pkg) {
    return <div className="text-center py-12 text-muted-foreground">Laden...</div>;
  }

  const handleNotifySubmit = async (sku: string, productName: string) => {
    const email = notifyEmails[sku]?.trim();
    if (!email || !email.includes('@')) {
      toast.error(t("contact.invalidEmail"));
      return;
    }
    try {
      await supabase.from("product_notifications").insert({ email, product_sku: sku });
      setNotifySubmitted(prev => ({ ...prev, [sku]: true }));
      toast.success(t("configurator.notifySuccess", { product: productName }));
    } catch {
      toast.error(t("contact.error"));
    }
  };

  // Group items by category
  const grouped = pkg.items.reduce<Record<string, { item: PackageItem; idx: number }[]>>(
    (acc, item, idx) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({ item, idx });
      return acc;
    },
    {}
  );

  const categoryOrder = ["converter", "battery", "solar", "fuse", "safety", "cable", "panel", "accessory"];

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

      {/* Savings highlight */}
      <Card className="mb-6 border-[#008593]/30 bg-[#008593]/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#008593] shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/90">{pkg.savingsHighlight}</p>
        </CardContent>
      </Card>

      {/* Price split summary */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">{t("configurator.directlyAvailable")}</p>
              <p className="text-lg font-bold text-green-600">€{Math.round(pkg.totalInStock)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("configurator.comingSoonLabel")}</p>
              <p className="text-lg font-bold text-blue-500">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("configurator.totalSystem")}</p>
              <p className="text-2xl font-bold">€{Math.round(pkg.totalPrice)}</p>
            </div>
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
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${categoryColors[item.category] ?? 'text-muted-foreground'}`}>
                          {iconMap[item.icon] ?? <Zap className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold">{item.name}</p>
                            {item.inStock && (
                              <Badge className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                                {t("configurator.inStockBadge")}
                              </Badge>
                            )}
                            {!item.inStock && item.comingSoon && (
                              <Badge className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30">
                                {t("configurator.comingSoonBadge")}
                              </Badge>
                            )}
                            {!item.inStock && !item.comingSoon && (
                              <Badge className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30">
                                {t("configurator.outOfStockBadge")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-primary italic">{item.reason}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="font-bold">€{(item.unitPrice * item.quantity).toFixed(2)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {item.isPerMeter ? `${item.quantity}m × €${item.unitPrice}` : `${item.quantity}× €${item.unitPrice}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action button area */}
                      <div className="mt-3 flex items-center gap-2">
                        {item.inStock && item.shopUrl ? (
                          <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                            <a href={item.shopUrl}>
                              <ShoppingCart className="w-3 h-3" />
                              {t("configurator.addToShop")}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        ) : !notifySubmitted[item.sku] ? (
                          <>
                            {notifyOpen[item.sku] ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  type="email"
                                  placeholder={t("newsletter.placeholder")}
                                  className="h-8 text-xs"
                                  value={notifyEmails[item.sku] ?? ''}
                                  onChange={(e) => setNotifyEmails(prev => ({ ...prev, [item.sku]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleNotifySubmit(item.sku, item.name)}
                                />
                                <Button size="sm" className="h-8 text-xs" onClick={() => handleNotifySubmit(item.sku, item.name)}>
                                  {t("configurator.notifySubmit")}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-xs"
                                onClick={() => setNotifyOpen(prev => ({ ...prev, [item.sku]: true }))}
                              >
                                <Bell className="w-3 h-3" />
                                {t("configurator.notifyMe")}
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-green-600">✓ {t("configurator.notifyConfirmed")}</p>
                        )}

                        {item.shopUrl && !item.inStock && (
                          <Button size="sm" variant="ghost" className="gap-1 text-xs" asChild>
                            <a href={item.shopUrl}>
                              {t("configurator.viewProduct")}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
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

      {/* System summary */}
      <Card className="mb-8 bg-secondary/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("configurator.systemSummary")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">{t("configurator.converterTitle")}</span>
            <span className="font-semibold text-right">VanXcel {pkg.converterW}W 5-in-1</span>
            <span className="text-muted-foreground">{t("configurator.batteryTitle")}</span>
            <span className="font-semibold text-right">{pkg.batteryAh} Ah LiFePO4</span>
            <span className="text-muted-foreground">{t("configurator.solarTitle")}</span>
            <span className="font-semibold text-right">{pkg.solarWp} Wp</span>
            <span className="text-muted-foreground">{t("configurator.altChargeTitle")}</span>
            <span className="font-semibold text-right">25A ({t("configurator.builtIn")})</span>
            <span className="text-muted-foreground">{t("configurator.day")}verbruik</span>
            <span className="font-semibold text-right">{state.totalDailyWh} Wh</span>
            <span className="text-muted-foreground">{t("configurator.estimatedAutarky")}</span>
            <span className="font-semibold text-right">
              {pkg.daysAutark} {t("configurator.daysAutark")}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold">{t("configurator.totalPrice")}</span>
            <span className="text-2xl font-bold">€{Math.round(pkg.totalPrice)}</span>
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
