import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVanXcelPrices } from "@/hooks/use-vanxcel-prices";
import { getDisplayPrice } from "@/lib/vanxcel-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Battery, Sun, Zap, Plug, AlertTriangle } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import type { ConfiguratorState } from "./ConfiguratorWizard";
import {
  calculateBattery,
  calculateSolar,
  get230vStats,
  getDaysAutark,
  getSunHours,
  getDailySolarYield,
  selectConverter,
  selectBatteryProduct,
  selectSolarProduct,
} from "@/lib/configurator-calculations";

interface Props {
  state: ConfiguratorState;
  onBack: () => void;
  onAdjustAppliances: () => void;
  onNext: () => void;
}

const ResultCard = ({
  icon,
  title,
  value,
  unit,
  subtitle,
  description,
  accentClass,
  warning,
  progress,
  delay,
  badge,
  features,
  price,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  unit: string;
  subtitle: string;
  description: string;
  accentClass: string;
  warning?: string;
  progress?: number;
  delay: number;
  badge?: string;
  features?: string[];
  price?: number;
}) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const { ref, value: animatedValue } = useCountUp(numericValue, 1200);
  const displayValue = typeof value === 'string' ? value : animatedValue;

  return (
    <div ref={ref}>
      <Card
        className={`border-2 ${accentClass} transition-all duration-700 animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {icon}
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </span>
            {badge && (
              <Badge className="text-xs bg-[#008593] text-white hover:bg-[#006d78]">
                {badge}
              </Badge>
            )}
          </div>

          <div className="mb-2">
            <span className="text-4xl font-bold tracking-tight">{displayValue}</span>
            <span className="text-xl text-muted-foreground ml-1">{unit}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>

          {progress !== undefined && (
            <div className="mb-3">
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <span className="text-xs text-muted-foreground mt-1 block">
                {Math.round(progress)}%
              </span>
            </div>
          )}

          {features && features.length > 0 && (
            <ul className="space-y-1 mb-3">
              {features.map((f, i) => (
                <li key={i} className="text-sm text-foreground/80">{f}</li>
              ))}
            </ul>
          )}

          <p className="text-sm text-foreground/80">{description}</p>

          {price !== undefined && (
            <p className="text-lg font-bold mt-2">€{price}</p>
          )}

          {warning && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{warning}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StepResults = ({ state, onBack, onAdjustAppliances, onNext }: Props) => {
  const { t } = useTranslation();

  const { data: appliances } = useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appliances").select("*");
      if (error) throw error;
      return data;
    },
  });

  const results = useMemo(() => {
    if (!appliances) return null;

    const batteryAh = calculateBattery(state.totalDailyWh, state.usageType ?? "regular");
    const maxSolarM2 = state.bodyType?.solar_max_area_m2
      ? Number(state.bodyType.solar_max_area_m2)
      : 4;
    const solarWpRaw = calculateSolar(state.totalDailyWh, state.climate ?? "benelux", maxSolarM2);
    const stats230v = get230vStats(state.selectedAppliances, appliances);
    const daysAutark = getDaysAutark(state.usageType ?? "regular");
    const sunHours = getSunHours(state.climate ?? "benelux");

    // VanXcel product selections
    const converterSel = selectConverter(stats230v.peakW, stats230v.count > 0);
    const converterW = Number(converterSel.product.specs.continuousW);
    const batterySel = selectBatteryProduct(batteryAh);
    const solarSel = selectSolarProduct(solarWpRaw);
    const solarWp = solarSel.cappedWp;
    const solarYield = getDailySolarYield(solarWp, state.climate ?? "benelux");

    const batteryWhCapacity = batteryAh * 12.8 * 0.8;
    const dailyPercent = (state.totalDailyWh / batteryWhCapacity) * 100;

    // Estimated total price (converter + battery + solar)
    const estimatedPrice = converterSel.product.price
      + (batterySel.product.price * batterySel.quantity)
      + (solarWp > 0 ? solarSel.product.price * solarSel.quantity : 0);

    return {
      batteryAh,
      solarWp,
      converterW,
      converterProduct: converterSel.product,
      converterWarning: converterSel.warning,
      converterExceeds: converterSel.exceeds,
      batteryProduct: batterySel.product,
      batteryQty: batterySel.quantity,
      solarProduct: solarSel.product,
      solarQty: solarSel.quantity,
      solarWarning: solarSel.warning,
      stats230v,
      daysAutark,
      sunHours,
      solarYield,
      dailyPercent,
      batteryWhCapacity,
      estimatedPrice,
    };
  }, [appliances, state]);

  if (!results) {
    return <div className="text-center py-12 text-muted-foreground">Laden...</div>;
  }

  const climateLabels: Record<string, string> = {
    benelux: t("configurator.climateBenelux"),
    southern_europe: t("configurator.climateSouth"),
    scandinavia: t("configurator.climateNorth"),
    all_season: t("configurator.climateAll"),
  };

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
        {t("configurator.resultsTitle")}
      </h2>
      <p className="text-muted-foreground mb-8">
        {t("configurator.resultsSubtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Card 1: VanXcel Converter */}
        <ResultCard
          icon={<Zap className="w-5 h-5 text-[#008593]" />}
          title={t("configurator.converterTitle")}
          value={`VanXcel ${results.converterW}W`}
          unit=""
          badge="5-IN-1"
          subtitle={t("configurator.converterSubtitle")}
          features={[
            `⚡ ${t("configurator.converterInverter")}: ${results.converterW}W pure sine wave`,
            `🔌 ${t("configurator.converterDcDc")}: 25A`,
            `☀️ ${t("configurator.converterMppt")}: ${t("configurator.converterMpptMax")}`,
            `🏠 ${t("configurator.converterShore")}: 230V AC IN`,
            `🔄 UPS: 25ms switchover`,
          ]}
          description={results.converterProduct.configuratorUse}
          accentClass="border-[#008593]/30"
          price={results.converterProduct.price}
          warning={results.converterWarning ?? undefined}
          delay={0}
        />

        {/* Card 2: Battery */}
        <ResultCard
          icon={<Battery className="w-5 h-5 text-green-500" />}
          title={t("configurator.batteryTitle")}
          value={results.batteryAh}
          unit="Ah LiFePO4"
          subtitle={`${state.totalDailyWh} Wh/${t("configurator.day")} × ${results.daysAutark} ${t("configurator.daysAutark")}`}
          description={`${results.daysAutark} ${t("configurator.daysAutarkDesc")} · ${Math.round(results.batteryWhCapacity)} Wh ${t("configurator.usableCapacity")}`}
          accentClass="border-green-500/30"
          progress={results.dailyPercent}
          price={results.batteryProduct.price * results.batteryQty}
          delay={100}
        />

        {/* Card 3: Solar */}
        <ResultCard
          icon={<Sun className="w-5 h-5 text-yellow-500" />}
          title={t("configurator.solarTitle")}
          value={results.solarWp}
          unit="Wp"
          subtitle={`${results.solarQty}× ${Number(results.solarProduct.specs.wattage)}W ${t("configurator.panels")}`}
          description={`${t("configurator.solarYieldPrefix")} ${results.solarYield} Wh/${t("configurator.day")} ${t("configurator.inClimate")} ${climateLabels[state.climate ?? "benelux"]}. ${t("configurator.solarConverterDirect")}`}
          accentClass="border-yellow-500/30"
          warning={results.solarWarning ?? undefined}
          delay={200}
        />

        {/* Card 4: Alternator Charging (built into converter) */}
        <ResultCard
          icon={<Plug className="w-5 h-5 text-orange-500" />}
          title={t("configurator.altChargeTitle")}
          value={25}
          unit="A DC-DC"
          subtitle={t("configurator.altChargeSubtitle")}
          description={t("configurator.altChargeDesc")}
          accentClass="border-orange-500/30"
          delay={300}
        />
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm bg-secondary/50 rounded-lg px-4 py-3 border border-border mb-6">
        <span className="flex items-center gap-1 font-semibold">
          <Battery className="w-4 h-4 text-green-500" /> {results.batteryAh}Ah
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="flex items-center gap-1 font-semibold">
          <Sun className="w-4 h-4 text-yellow-500" /> {results.solarWp}Wp
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="flex items-center gap-1 font-semibold">
          <Zap className="w-4 h-4 text-[#008593]" /> VanXcel {results.converterW}W 5-in-1
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="flex items-center gap-1 font-semibold">
          💰 ~€{results.estimatedPrice}
        </span>
      </div>

      {/* Adjust link */}
      <div className="text-center mb-6">
        <button
          onClick={onAdjustAppliances}
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          {t("configurator.adjustAppliances")}
        </button>
      </div>

      <div className="text-center">
        <Button size="lg" className="btn-shimmer gap-2" onClick={onNext}>
          {t("configurator.nextStep")}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default StepResults;
