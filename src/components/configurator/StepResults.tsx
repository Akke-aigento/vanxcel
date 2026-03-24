import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Battery, Sun, Zap, Plug, AlertTriangle } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import type { ConfiguratorState } from "./ConfiguratorWizard";
import type { SelectedAppliance } from "./StepAppliances";
import {
  calculateBattery,
  calculateSolar,
  calculateInverter,
  calculateDcDc,
  getDaysAutark,
  getSunHours,
  getDailySolarYield,
  get230vStats,
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
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  subtitle: string;
  description: string;
  accentClass: string;
  warning?: string;
  progress?: number;
  delay: number;
}) => {
  const { ref, value: animatedValue } = useCountUp(value, 1200);

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
          </div>

          <div className="mb-2">
            <span className="text-4xl font-bold tracking-tight">{animatedValue}</span>
            <span className="text-xl text-muted-foreground ml-1">{unit}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>

          {progress !== undefined && (
            <div className="mb-3">
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <span className="text-xs text-muted-foreground mt-1 block">
                {Math.round(progress)}% {unit === "Ah" ? "dagelijks verbruik" : ""}
              </span>
            </div>
          )}

          <p className="text-sm text-foreground/80">{description}</p>

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
    const solarWp = calculateSolar(state.totalDailyWh, state.climate ?? "benelux", maxSolarM2);
    const inverterW = calculateInverter(state.selectedAppliances, appliances);
    const dcDcA = calculateDcDc(state.motorisation, batteryAh);
    const stats230v = get230vStats(state.selectedAppliances, appliances);
    const daysAutark = getDaysAutark(state.usageType ?? "regular");
    const sunHours = getSunHours(state.climate ?? "benelux");
    const solarYield = getDailySolarYield(solarWp, state.climate ?? "benelux");
    const maxSolarWp = Math.round(maxSolarM2 * 180);
    const solarCapped = solarWp >= maxSolarWp && maxSolarM2 < 10;
    const batteryWhCapacity = batteryAh * 12.8 * 0.8;
    const dailyPercent = (state.totalDailyWh / batteryWhCapacity) * 100;
    const panelCount = solarWp <= 200 ? 1 : Math.ceil(solarWp / 200);

    return {
      batteryAh,
      solarWp,
      inverterW,
      dcDcA,
      stats230v,
      daysAutark,
      sunHours,
      solarYield,
      solarCapped,
      maxSolarWp,
      dailyPercent,
      panelCount,
      batteryWhCapacity,
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

  const isSmartAlt = state.motorisation?.has_smart_alternator;

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
        <ResultCard
          icon={<Battery className="w-5 h-5 text-green-500" />}
          title={t("configurator.batteryTitle")}
          value={results.batteryAh}
          unit="Ah LiFePO4"
          subtitle={`${state.totalDailyWh} Wh/${t("configurator.day")} × ${results.daysAutark} ${t("configurator.daysAutark")}`}
          description={`${results.daysAutark} ${t("configurator.daysAutarkDesc")} · ${Math.round(results.batteryWhCapacity)} Wh ${t("configurator.usableCapacity")}`}
          accentClass="border-green-500/30"
          progress={results.dailyPercent}
          delay={0}
        />

        <ResultCard
          icon={<Sun className="w-5 h-5 text-yellow-500" />}
          title={t("configurator.solarTitle")}
          value={results.solarWp}
          unit="Wp"
          subtitle={`${results.panelCount}× ${Math.round(results.solarWp / results.panelCount)}W ${t("configurator.panels")}`}
          description={`${t("configurator.solarYieldPrefix")} ${results.solarYield} Wh/${t("configurator.day")} ${t("configurator.inClimate")} ${climateLabels[state.climate ?? "benelux"]}`}
          accentClass="border-yellow-500/30"
          warning={results.solarCapped ? `${t("configurator.roofWarning")} ${results.maxSolarWp} Wp` : undefined}
          delay={100}
        />

        <ResultCard
          icon={<Zap className="w-5 h-5 text-blue-500" />}
          title={t("configurator.inverterTitle")}
          value={results.inverterW}
          unit={results.inverterW > 0 ? "W" : ""}
          subtitle={results.inverterW > 0 ? t("configurator.pureSineWave") : t("configurator.inverterNotNeeded")}
          description={
            results.inverterW > 0
              ? `${results.stats230v.count} ${t("configurator.appliancesOn230v")} · ${t("configurator.peakPower")} ${results.stats230v.peakW}W`
              : t("configurator.no230vAppliances")
          }
          accentClass="border-blue-500/30"
          delay={200}
        />

        <ResultCard
          icon={<Plug className="w-5 h-5 text-orange-500" />}
          title={t("configurator.dcDcTitle")}
          value={results.dcDcA}
          unit="A"
          subtitle={
            isSmartAlt
              ? `DC-DC ${t("configurator.dcDcRequired")}`
              : `DC-DC ${t("configurator.dcDcRecommended")}`
          }
          description={`${t("configurator.chargesVia")} ${state.motorisation?.alternator_rated_amps ?? "?"}A ${t("configurator.alternator").toLowerCase()}`}
          accentClass="border-orange-500/30"
          warning={
            isSmartAlt
              ? t("configurator.smartAlternatorDesc")
              : undefined
          }
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
          <Zap className="w-4 h-4 text-blue-500" /> {results.inverterW > 0 ? `${results.inverterW}W` : "—"}
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="flex items-center gap-1 font-semibold">
          <Plug className="w-4 h-4 text-orange-500" /> {results.dcDcA}A DC-DC
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
