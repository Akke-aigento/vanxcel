import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  AlertTriangle,
  Info,
  AlertCircle,
  MapPin,
  Ruler,
  Wrench,
  CircleDot,
  Shield,
  Camera,
  Tag,
  Zap,
  Snowflake,
  Cable,
} from "lucide-react";
import type { ConfiguratorState } from "./ConfiguratorWizard";
import {
  useVehicleWarnings,
  useBatteryLocations,
  useCableRoutes,
  useGroundingPoints,
} from "@/hooks/use-configurator";
import {
  calculateBattery,
  calculateSolar,
  calculateInverter,
  calculateDcDc,
} from "@/lib/configurator-calculations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  state: ConfiguratorState;
  onBack: () => void;
}

const STANDARD_SIZES = [2.5, 4, 6, 10, 16, 25, 35, 50];

function calcCableSize(amps: number, lengthM: number): number {
  const raw = (amps * lengthM * 2) / (0.36 * 56);
  return STANDARD_SIZES.find((s) => s >= raw) || 50;
}

function getMinCableSize(
  circuitId: string,
  specs: { dcDcA: number; solarWp: number; inverterW: number; totalDailyWh: number; mpptA: number }
): number {
  switch (circuitId) {
    case "starter_to_dcdc":
    case "dcdc_to_leisure":
      if (specs.dcDcA <= 30) return 10;
      if (specs.dcDcA <= 50) return 16;
      return 25;
    case "solar_to_mppt":
      if (specs.solarWp <= 200) return 2.5;
      if (specs.solarWp <= 400) return 4;
      return 6;
    case "battery_to_fusebox":
      return specs.totalDailyWh > 1000 ? 25 : 16;
    case "battery_to_inverter":
      if (specs.inverterW <= 1000) return 25;
      if (specs.inverterW <= 2000) return 35;
      return 50;
    case "mppt_to_battery":
      if (specs.mpptA <= 20) return 6;
      if (specs.mpptA <= 40) return 10;
      return 16;
    default:
      return 4;
}

function getFuseSpec(
  circuitId: string,
  specs: { dcDcA: number; inverterW: number }
): string | null {
  switch (circuitId) {
    case "starter_to_dcdc":
    case "dcdc_to_leisure": {
      const rating = Math.ceil(specs.dcDcA * 1.25 / 5) * 5;
      return `MIDI ${rating}A`;
    }
    case "battery_to_fusebox": {
      const mainCable = specs.inverterW > 2000 ? 50 : specs.inverterW > 1000 ? 35 : 25;
      const anlA = mainCable >= 50 ? 300 : mainCable >= 35 ? 200 : 150;
      return `ANL ${anlA}A`;
    }
    case "battery_to_inverter": {
      const invAnl = specs.inverterW > 2000 ? 300 : specs.inverterW > 1000 ? 200 : 150;
      return `ANL ${invAnl}A`;
    }
    default:
      return null;
  }
}
}

const severityConfig: Record<string, { icon: React.ReactNode; className: string }> = {
  critical: {
    icon: <AlertCircle className="w-4 h-4" />,
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: "difficultyEasy", className: "bg-green-500/20 text-green-700 dark:text-green-400" },
  moderate: { label: "difficultyModerate", className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  hard: { label: "difficultyHard", className: "bg-destructive/20 text-destructive" },
};

const StepInstallGuide = ({ state, onBack }: Props) => {
  const { t } = useTranslation();

  const { data: warnings } = useVehicleWarnings(
    state.vehicleId,
    state.buildYear,
    state.motorisation?.engine_code ?? null
  );
  const { data: batteryLocations } = useBatteryLocations(state.vehicleId);
  const { data: cableRoutes } = useCableRoutes(state.vehicleId);
  const { data: groundingPoints } = useGroundingPoints(state.vehicleId);
  const { data: appliances } = useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appliances").select("*");
      if (error) throw error;
      return data;
    },
  });

  const calc = useMemo(() => {
    if (!appliances) return null;
    const batteryAh = calculateBattery(state.totalDailyWh, state.usageType ?? "regular");
    const solarWp = calculateSolar(
      state.totalDailyWh,
      state.climate ?? "benelux",
      state.bodyType?.solar_max_area_m2 ? Number(state.bodyType.solar_max_area_m2) : 999
    );
    const inverterW = calculateInverter(state.selectedAppliances, appliances);
    const dcDcA = calculateDcDc(state.motorisation, batteryAh);
    return { batteryAh, solarWp, inverterW, dcDcA };
  }, [appliances, state]);

  if (!calc) {
    return <div className="text-center py-12 text-muted-foreground">Laden...</div>;
  }

  // Build cabling overview table
  const starterToDcDcDist =
    cableRoutes?.find((r) => r.route_id === "starter_to_leisure")?.distance_meters ?? 1.0;
  const solarToMpptDist =
    cableRoutes?.find((r) => r.route_id === "roof_to_interior")?.distance_meters ?? 3.5;

  const mpptA = calc.solarWp > 0 ? Math.ceil(calc.solarWp / 12) : 0;
  const minSpecs = {
    dcDcA: calc.dcDcA,
    solarWp: calc.solarWp,
    inverterW: calc.inverterW,
    totalDailyWh: state.totalDailyWh,
    mpptA,
  };

  const cablingRows = [
    {
      circuitId: "starter_to_dcdc",
      from: t("configurator.cableStarterBattery"),
      to: "DC-DC",
      distance: Number(starterToDcDcDist),
      amps: calc.dcDcA,
      type: t("configurator.cablePosPlusNeg"),
    },
    {
      circuitId: "dcdc_to_leisure",
      from: "DC-DC",
      to: t("configurator.cableLeisureBattery"),
      distance: 0.5,
      amps: calc.dcDcA,
      type: t("configurator.cablePosPlusNeg"),
    },
    ...(calc.solarWp > 0
      ? [
          {
            circuitId: "solar_to_mppt",
            from: t("configurator.cableSolarPanel"),
            to: "MPPT",
            distance: Number(solarToMpptDist),
            amps: mpptA,
            type: "MC4 → " + t("configurator.cableLug"),
          },
          {
            circuitId: "mppt_to_battery",
            from: "MPPT",
            to: t("configurator.cableBattery"),
            distance: 0.5,
            amps: mpptA,
            type: t("configurator.cablePosPlusNeg"),
          },
        ]
      : []),
    {
      circuitId: "battery_to_fusebox",
      from: t("configurator.cableBattery"),
      to: t("configurator.cableFuseBox"),
      distance: 0.3,
      amps: 100,
      type: t("configurator.cablePos"),
    },
    ...(calc.inverterW > 0
      ? [
          {
            circuitId: "battery_to_inverter",
            from: t("configurator.cableBattery"),
            to: t("configurator.cableInverter"),
            distance: 0.5,
            amps: Math.ceil(calc.inverterW / 12 * 1.25),
            type: t("configurator.cablePosPlusNeg"),
          },
        ]
      : []),
  ];

  const tips = [
    { icon: <Shield className="w-5 h-5" />, key: "tipFuse" },
    { icon: <Tag className="w-5 h-5" />, key: "tipLabel" },
    { icon: <Zap className="w-5 h-5" />, key: "tipTest" },
    { icon: <Camera className="w-5 h-5" />, key: "tipPhotos" },
  ];

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
        {t("configurator.installTitle")}
      </h2>
      <p className="text-muted-foreground mb-8">
        {t("configurator.installSubtitle")}
      </p>

      {/* Section 1: Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("configurator.warningsSection")}
          </h3>
          {warnings.map((w) => {
            const sev = severityConfig[w.severity] ?? severityConfig.info;
            return (
              <Alert key={w.id} className={sev.className}>
                {sev.icon}
                <AlertTitle>{w.title}</AlertTitle>
                <AlertDescription>
                  {w.description}
                  {w.solution && (
                    <p className="mt-1 font-medium">💡 {w.solution}</p>
                  )}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Section 2: Battery locations */}
      {batteryLocations && batteryLocations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("configurator.batteryLocationSection")}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[...batteryLocations]
              .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
              .map((loc, i) => (
                <Card
                  key={loc.id}
                  className={`animate-fade-in-up ${i === 0 ? "border-primary/40" : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{loc.label}</p>
                          {i === 0 && (
                            <Badge variant="default" className="text-xs">
                              {t("configurator.recommended")}
                            </Badge>
                          )}
                        </div>
                        {(loc.max_length_mm || loc.max_width_mm || loc.max_height_mm) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Ruler className="w-3 h-3" />
                            {loc.max_length_mm ?? "—"} × {loc.max_width_mm ?? "—"} ×{" "}
                            {loc.max_height_mm ?? "—"} mm
                          </div>
                        )}
                        {loc.max_weight_kg && (
                          <p className="text-xs text-muted-foreground">
                            Max. {loc.max_weight_kg} kg
                          </p>
                        )}
                        {loc.mounting_notes && (
                          <p className="text-xs mt-2">{loc.mounting_notes}</p>
                        )}
                        {loc.selfbuild_notes && (
                          <p className="text-xs text-primary italic mt-1">
                            {loc.selfbuild_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Section 3: Cable routes */}
      {cableRoutes && cableRoutes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("configurator.cableRoutesSection")}
          </h3>
          <Accordion type="multiple" defaultValue={cableRoutes.map((r) => r.id)}>
            {cableRoutes.map((route) => {
              const diff = difficultyConfig[route.difficulty ?? "moderate"] ?? difficultyConfig.moderate;
              return (
                <AccordionItem key={route.id} value={route.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-semibold">{route.label}</span>
                      <Badge className={`${diff.className} text-xs`}>
                        {t(`configurator.${diff.label}`)}
                      </Badge>
                      {route.distance_meters && (
                        <span className="text-xs text-muted-foreground">
                          {Number(route.distance_meters)}m
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {route.description && <p>{route.description}</p>}
                      <div className="flex flex-wrap gap-4">
                        <span className="text-muted-foreground">
                          {t("configurator.recommendedCableSize")}:{" "}
                          <strong>
                            {calc.dcDcA <= 20
                              ? route.cable_size_for_20a
                              : calc.dcDcA <= 30
                              ? route.cable_size_for_30a
                              : calc.dcDcA <= 50
                              ? route.cable_size_for_50a
                              : route.cable_size_for_80a}{" "}
                            mm²
                          </strong>
                        </span>
                      </div>
                      {route.tools_required && route.tools_required.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Wrench className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span>{route.tools_required.join(", ")}</span>
                        </div>
                      )}
                      {route.hazards && route.hazards.length > 0 && (
                        <div className="flex items-start gap-2 text-destructive">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{route.hazards.join(", ")}</span>
                        </div>
                      )}
                      {route.cable_protection && (
                        <p className="text-muted-foreground">
                          🛡️ {route.cable_protection}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Section 4: Grounding points */}
      {groundingPoints && groundingPoints.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("configurator.groundingSection")}
          </h3>
          <div className="space-y-2">
            {groundingPoints.map((gp) => (
              <Card key={gp.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <CircleDot className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{gp.location}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      {gp.bolt_size && (
                        <span>
                          {t("configurator.boltSize")}: {gp.bolt_size}
                        </span>
                      )}
                      {gp.max_cable_size_mm2 && (
                        <span>
                          Max. {gp.max_cable_size_mm2} mm²
                        </span>
                      )}
                      <Badge
                        variant={gp.existing_ground ? "default" : "outline"}
                        className="text-xs"
                      >
                        {gp.existing_ground
                          ? t("configurator.existingGround")
                          : t("configurator.needsDrilling")}
                      </Badge>
                    </div>
                    {gp.notes && <p className="text-xs mt-1">{gp.notes}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Cabling overview table */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {t("configurator.cablingOverview")}
        </h3>
        <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 mb-4">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-sm font-medium">
            {t("configurator.cableSafetyNote")}
          </AlertDescription>
        </Alert>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("configurator.cableFrom")} → {t("configurator.cableTo")}</TableHead>
                  <TableHead>{t("configurator.distance")}</TableHead>
                  <TableHead>{t("configurator.cableSize")}</TableHead>
                  <TableHead>{t("configurator.current")}</TableHead>
                  <TableHead>{t("configurator.cableType")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cablingRows.map((row, i) => {
                  const calculated = calcCableSize(row.amps, row.distance);
                  const minimum = getMinCableSize(row.circuitId, minSpecs);
                  const finalSize = Math.max(calculated, minimum);
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {row.from} → {row.to}
                      </TableCell>
                      <TableCell>{row.distance}m</TableCell>
                      <TableCell>
                        <span className="font-semibold">{finalSize} mm²</span>
                        {finalSize >= 16 && (
                          <p className="text-xs text-destructive mt-1">
                            {t("configurator.cableLugWarning")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{row.amps}A</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.type}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Tips */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {t("configurator.installTips")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {tips.map((tip) => (
            <Card key={tip.key}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="text-primary mt-0.5">{tip.icon}</div>
                <p className="text-sm">{t(`configurator.${tip.key}`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepInstallGuide;
