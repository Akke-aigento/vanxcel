import { useMemo, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  Clock,
  CheckCircle2,
  Battery,
  Box,
  Route,
  Plug,
  TestTube,
  FileCheck,
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
  get230vStats,
  selectConverter,
} from "@/lib/configurator-calculations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WiringDiagram from "./WiringDiagram";
import PhaseIllustration from "./PhaseIllustration";

interface Props {
  state: ConfiguratorState;
  onBack: () => void;
}

/* ── Cable helpers (unchanged) ── */
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
    case "battery_to_chassis":
      return 25;
    default:
      return 4;
  }
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

function getCableForCircuit(
  circuitId: string,
  amps: number,
  distance: number,
  minSpecs: { dcDcA: number; solarWp: number; inverterW: number; totalDailyWh: number; mpptA: number }
): number {
  const calculated = calcCableSize(amps, distance);
  const minimum = getMinCableSize(circuitId, minSpecs);
  return Math.max(calculated, minimum);
}

/* ── Severity config ── */
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

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-700 dark:text-green-400",
  moderate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  hard: "bg-destructive/20 text-destructive",
};

/* ── Phase icons ── */
const phaseIcons = [
  <FileCheck className="w-5 h-5" />,
  <Battery className="w-5 h-5" />,
  <Box className="w-5 h-5" />,
  <Route className="w-5 h-5" />,
  <Plug className="w-5 h-5" />,
  <TestTube className="w-5 h-5" />,
  <CheckCircle2 className="w-5 h-5" />,
];

/* ── Component ── */
const StepInstallGuide = ({ state, onBack }: Props) => {
  const { t } = useTranslation();
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [activePhase, setActivePhase] = useState<string | null>("phase-0");
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});
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
    const stats230v = get230vStats(state.selectedAppliances, appliances);
    const converterSel = selectConverter(stats230v.peakW, stats230v.count > 0);
    const inverterW = Number(converterSel.product.specs.continuousW);
    const dcDcA = 25; // Built into VanXcel 5-in-1 Converter
    return { batteryAh, solarWp, inverterW, dcDcA };
  }, [appliances, state]);

  if (!calc) {
    return <div className="text-center py-12 text-muted-foreground">Laden...</div>;
  }

  const vehicleName = state.vehicleId
    ? `${state.motorisation?.engine_family ?? ""} ${state.bodyType?.label ?? ""}`.trim()
    : "";

  const starterBatteryLocation = state.motorisation?.starter_battery_location ?? t("configurator.phase0StarterDefault");

  const starterToDcDcRoute = cableRoutes?.find((r) => r.route_id === "starter_to_leisure");
  const solarToMpptRoute = cableRoutes?.find((r) => r.route_id === "roof_to_interior");
  const starterToDcDcDist = Number(starterToDcDcRoute?.distance_meters ?? 1.0);
  const solarToMpptDist = Number(solarToMpptRoute?.distance_meters ?? 3.5);

  const mpptA = calc.solarWp > 0 ? Math.ceil(calc.solarWp / 12) : 0;
  const minSpecs = {
    dcDcA: calc.dcDcA,
    solarWp: calc.solarWp,
    inverterW: calc.inverterW,
    totalDailyWh: state.totalDailyWh,
    mpptA,
  };

  const dcDcCableSize = getCableForCircuit("starter_to_dcdc", calc.dcDcA, starterToDcDcDist, minSpecs);
  const fuseBoxCableSize = getCableForCircuit("battery_to_fusebox", 100, 0.3, minSpecs);
  const inverterCableSize = calc.inverterW > 0
    ? getCableForCircuit("battery_to_inverter", Math.ceil(calc.inverterW / 12 * 1.25), 0.5, minSpecs)
    : 0;
  const solarCableSize = calc.solarWp > 0
    ? getCableForCircuit("solar_to_mppt", mpptA, solarToMpptDist, minSpecs)
    : 0;
  const mpptBatteryCableSize = calc.solarWp > 0
    ? getCableForCircuit("mppt_to_battery", mpptA, 0.5, minSpecs)
    : 0;

  const mainFuseSize = inverterCableSize >= 50 ? 300 : inverterCableSize >= 35 ? 200 : 150;
  const topBatteryLocation = batteryLocations?.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))?.[0];

  const togglePhase = (phase: number) => {
    setCompletedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const handleComponentClick = useCallback((phaseId: string) => {
    setActivePhase(phaseId);
    const el = phaseRefs.current[phaseId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const totalPhases = 7;
  const progressPercent = (completedPhases.length / totalPhases) * 100;

  /* ── Cabling rows for reference table ── */
  const cablingRows = [
    {
      circuitId: "starter_to_dcdc",
      from: t("configurator.cableStarterBattery"),
      to: "DC-DC",
      distance: starterToDcDcDist,
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
            distance: solarToMpptDist,
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
    {
      circuitId: "battery_to_chassis",
      from: t("configurator.cableBattery"),
      to: t("configurator.cableChassisGround"),
      distance: 0.3,
      amps: calc.inverterW > 0 ? Math.ceil(calc.inverterW / 12 * 1.25) : 100,
      type: t("configurator.cableNeg"),
    },
  ];

  /* ── Phase header component ── */
  const PhaseHeader = ({
    phase,
    difficulty,
    time,
  }: {
    phase: number;
    difficulty: "easy" | "moderate" | "hard";
    time: string;
  }) => (
    <div className="flex items-center gap-3 text-left w-full">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
        {phase}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-semibold">{t(`configurator.phase${phase}Title`)}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-xs gap-1">
          <Clock className="w-3 h-3" /> {time}
        </Badge>
        <Badge className={`text-xs ${difficultyColors[difficulty]}`}>
          {t(`configurator.difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`)}
        </Badge>
      </div>
    </div>
  );

  /* ── Warning block component ── */
  const WarningBlock = ({ text }: { text: string }) => (
    <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 my-3">
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription className="text-sm font-medium">{text}</AlertDescription>
    </Alert>
  );

  const DangerBlock = ({ text }: { text: string }) => (
    <Alert className="border-destructive/50 bg-destructive/10 text-destructive my-3">
      <AlertCircle className="w-4 h-4" />
      <AlertDescription className="text-sm font-medium">{text}</AlertDescription>
    </Alert>
  );

  /* ── Materials block ── */
  const MaterialsBlock = ({ items }: { items: string[] }) => (
    <div className="bg-muted/50 rounded-lg p-4 mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {t("configurator.materialsNeeded")}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );

  /* ── Phase completed checkbox ── */
  const PhaseCheckbox = ({ phase }: { phase: number }) => (
    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
      <Checkbox
        id={`phase-${phase}`}
        checked={completedPhases.includes(phase)}
        onCheckedChange={() => togglePhase(phase)}
      />
      <label
        htmlFor={`phase-${phase}`}
        className="text-sm font-medium cursor-pointer select-none"
      >
        {t("configurator.phaseComplete")}
      </label>
    </div>
  );

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
      <p className="text-muted-foreground mb-4">
        {t("configurator.installSubtitle")}
      </p>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {completedPhases.length} / {totalPhases} {t("configurator.phasesCompleted")}
          </span>
          <span className="font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Safety banners */}
      <div className="space-y-3 mb-8">
        <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{t("configurator.safetyFuseTitle")}</AlertTitle>
          <AlertDescription>{t("configurator.safetyFuseDesc")}</AlertDescription>
        </Alert>

        {calc.inverterW > 0 && (
          <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
            <Zap className="w-4 h-4" />
            <AlertTitle>{t("configurator.safety230vTitle")}</AlertTitle>
            <AlertDescription>{t("configurator.safety230vDesc")}</AlertDescription>
          </Alert>
        )}

        <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <Snowflake className="w-4 h-4" />
          <AlertTitle>{t("configurator.safetyFrostTitle")}</AlertTitle>
          <AlertDescription>{t("configurator.safetyFrostDesc")}</AlertDescription>
        </Alert>

        <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <Cable className="w-4 h-4" />
          <AlertTitle>{t("configurator.safetyCableTitle")}</AlertTitle>
          <AlertDescription>{t("configurator.safetyCableDesc")}</AlertDescription>
        </Alert>
      </div>

      {/* Vehicle-specific warnings */}
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

      {/* ═══ WIRING DIAGRAM ═══ */}
      <WiringDiagram
        state={state}
        calc={calc}
        topBatteryLocation={topBatteryLocation ? { location_id: topBatteryLocation.location_id, label: topBatteryLocation.label } : null}
        activePhase={activePhase}
        onComponentClick={handleComponentClick}
      />

      {/* ═══════════ 7 PHASES ═══════════ */}
      <Accordion
        type="multiple"
        defaultValue={["phase-0"]}
        className="space-y-3"
        onValueChange={(values) => {
          const last = values[values.length - 1] ?? null;
          setActivePhase(last);
        }}
      >

        {/* ── PHASE 0: PREPARATION ── */}
        <AccordionItem value="phase-0" className="border rounded-lg overflow-hidden" ref={(el) => { phaseRefs.current["phase-0"] = el; }}>
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={0} difficulty="easy" time="1-2h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <PhaseIllustration phase={0} />
            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>{t("configurator.phase0Step1")}</li>
              <li>{t("configurator.phase0Step2")}</li>
              <li>
                {t("configurator.phase0Step3", { location: starterBatteryLocation })}
              </li>
              <li>{t("configurator.phase0Step4")}</li>
              <li>{t("configurator.phase0Step5")}</li>
              <li>{t("configurator.phase0Step6")}</li>
            </ol>
            <WarningBlock text={t("configurator.phase0Warning")} />
            <MaterialsBlock
              items={[
                t("configurator.toolMultimeter"),
                t("configurator.toolCrimpTool"),
                t("configurator.toolStepDrill"),
                t("configurator.toolDrill"),
                t("configurator.toolScrewdriverSet"),
                t("configurator.toolWrenchSet"),
                t("configurator.toolCablePuller"),
                t("configurator.toolHeatShrink"),
                t("configurator.toolCableTies"),
                t("configurator.toolMarker"),
              ]}
            />
            <PhaseCheckbox phase={0} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 1: BATTERY MOUNTING ── */}
        <AccordionItem value="phase-1" className="border rounded-lg overflow-hidden" ref={(el) => { phaseRefs.current["phase-1"] = el; }}>
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={1} difficulty="moderate" time="1-3h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <PhaseIllustration phase={1} batteryLocation={topBatteryLocation?.location_id} batteryAh={calc.batteryAh} />
            {topBatteryLocation && (
              <Card className="mb-4 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{topBatteryLocation.label}</p>
                        <Badge variant="default" className="text-xs">
                          {t("configurator.recommended")}
                        </Badge>
                      </div>
                      {(topBatteryLocation.max_length_mm || topBatteryLocation.max_width_mm || topBatteryLocation.max_height_mm) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Ruler className="w-3 h-3" />
                          {topBatteryLocation.max_length_mm ?? "—"} × {topBatteryLocation.max_width_mm ?? "—"} × {topBatteryLocation.max_height_mm ?? "—"} mm
                        </div>
                      )}
                      {topBatteryLocation.max_weight_kg && (
                        <p className="text-xs text-muted-foreground">Max. {topBatteryLocation.max_weight_kg} kg</p>
                      )}
                      {topBatteryLocation.mounting_notes && (
                        <p className="text-xs mt-2">{topBatteryLocation.mounting_notes}</p>
                      )}
                      {topBatteryLocation.selfbuild_notes && (
                        <p className="text-xs text-primary italic mt-1">{topBatteryLocation.selfbuild_notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>{t("configurator.phase1Step1", { ah: calc.batteryAh })}</li>
              <li>{t("configurator.phase1Step2")}</li>
              <li>{t("configurator.phase1Step3")}</li>
              <li>{t("configurator.phase1Step4")}</li>
              <li>{t("configurator.phase1Step5", { fuseSize: mainFuseSize })}</li>
              <li>{t("configurator.phase1Step6")}</li>
            </ol>
            <WarningBlock text={t("configurator.phase1Warning")} />
            <MaterialsBlock
              items={[
                `${calc.batteryAh}Ah LiFePO4`,
                `ANL ${mainFuseSize}A + ${t("configurator.fuseHolder")}`,
                t("configurator.disconnectSwitch"),
                t("configurator.negativeBusbar"),
                t("configurator.mountingBracket"),
                "M8 " + t("configurator.bolts"),
              ]}
            />
            <PhaseCheckbox phase={1} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 2: FUSE BOX & BUSBARS ── */}
        <AccordionItem value="phase-2" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={2} difficulty="easy" time="1-2h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>{t("configurator.phase2Step1")}</li>
              <li>{t("configurator.phase2Step2")}</li>
              <li>{t("configurator.phase2Step3")}</li>
              <li>{t("configurator.phase2Step4")}</li>
              <li>{t("configurator.phase2Step5")}</li>
            </ol>
            <MaterialsBlock
              items={[
                t("configurator.fuseBox12way"),
                t("configurator.bladeFuses"),
                t("configurator.negativeBusbar"),
                t("configurator.screws"),
                t("configurator.toolMarker"),
              ]}
            />
            <PhaseCheckbox phase={2} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 3: CABLE ROUTING ── */}
        <AccordionItem value="phase-3" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={3} difficulty="hard" time="3-6h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">{t("configurator.phase3Intro")}</p>

            {/* Route 1: Starter → DC-DC */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                {t("configurator.route1Title")}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                <li>{t("configurator.route1Step1", { location: starterBatteryLocation })}</li>
                <li>{t("configurator.route1Step2", { size: dcDcCableSize })}</li>
                {starterToDcDcRoute?.description && (
                  <li>{t("configurator.route1Step3")}: {starterToDcDcRoute.description}</li>
                )}
                <li>{t("configurator.route1Step4", { distance: starterToDcDcDist })}</li>
                {starterToDcDcRoute?.cable_protection && (
                  <li>{t("configurator.route1Step5", { protection: starterToDcDcRoute.cable_protection })}</li>
                )}
                {starterToDcDcRoute?.hazards && starterToDcDcRoute.hazards.length > 0 && (
                  <li className="text-destructive">
                    ⚠️ {starterToDcDcRoute.hazards.join(", ")}
                  </li>
                )}
                <li>{t("configurator.routeDoNotConnect")}</li>
              </ol>

              {/* Route 2: DC-DC → Leisure */}
              <h4 className="font-semibold text-sm flex items-center gap-2 mt-6">
                <Route className="w-4 h-4 text-primary" />
                {t("configurator.route2Title")}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                <li>{t("configurator.route2Step1")}</li>
                <li>{t("configurator.route2Step2", { size: dcDcCableSize })}</li>
              </ol>

              {/* Route 3: Battery → Fuse box */}
              <h4 className="font-semibold text-sm flex items-center gap-2 mt-6">
                <Route className="w-4 h-4 text-primary" />
                {t("configurator.route3Title")}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                <li>{t("configurator.route3Step1", { size: fuseBoxCableSize })}</li>
                <li>{t("configurator.route3Step2", { size: fuseBoxCableSize })}</li>
              </ol>

              {/* Route 4: Battery → Inverter (conditional) */}
              {calc.inverterW > 0 && (
                <>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mt-6">
                    <Route className="w-4 h-4 text-primary" />
                    {t("configurator.route4Title")}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                    <li>{t("configurator.route4Step1")}</li>
                    <li>{t("configurator.route4Step2", { size: inverterCableSize })}</li>
                    <li>{t("configurator.route4Step3")}</li>
                    <li>{t("configurator.route4Step4")}</li>
                  </ol>
                  {inverterCableSize >= 35 && (
                    <WarningBlock text={t("configurator.route4HeavyCableWarning")} />
                  )}
                </>
              )}

              {/* Route 5: Solar → MPPT (conditional) */}
              {calc.solarWp > 0 && (
                <>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mt-6">
                    <Route className="w-4 h-4 text-primary" />
                    {t("configurator.route5Title")}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                    <li>{t("configurator.route5Step1")}</li>
                    <li>{t("configurator.route5Step2")}</li>
                    <li>{t("configurator.route5Step3")}</li>
                    <li>{t("configurator.route5Step4")}</li>
                    {solarToMpptRoute?.description && (
                      <li>{solarToMpptRoute.description}</li>
                    )}
                    <li>{t("configurator.route5Step5", { size: solarCableSize, distance: solarToMpptDist })}</li>
                  </ol>

                  {/* Route 6: MPPT → Battery */}
                  <h4 className="font-semibold text-sm flex items-center gap-2 mt-6">
                    <Route className="w-4 h-4 text-primary" />
                    {t("configurator.route6Title")}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed pl-2">
                    <li>{t("configurator.route6Step1", { size: mpptBatteryCableSize })}</li>
                  </ol>
                </>
              )}
            </div>

            <WarningBlock text={t("configurator.phase3Warning")} />

            {/* General cable tips */}
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t("configurator.cableTipsTitle")}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>{t("configurator.cableTip1")}</li>
                <li>{t("configurator.cableTip2")}</li>
                <li>{t("configurator.cableTip3")}</li>
                <li>{t("configurator.cableTip4")}</li>
                <li>{t("configurator.cableTip5")}</li>
              </ul>
            </div>

            <MaterialsBlock
              items={[
                t("configurator.allCablesFromPackage"),
                t("configurator.splitLoom"),
                t("configurator.cableTiesLabel"),
                t("configurator.labelsAndTape"),
                ...(calc.solarWp > 0 ? [t("configurator.roofGland"), t("configurator.dekaSika")] : []),
                t("configurator.rubberGrommets"),
              ]}
            />
            <PhaseCheckbox phase={3} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 4: CONNECT EVERYTHING ── */}
        <AccordionItem value="phase-4" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={4} difficulty="moderate" time="2-4h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <DangerBlock text={t("configurator.phase4OrderWarning")} />

            <ol className="list-decimal list-inside space-y-4 text-sm leading-relaxed">
              {/* Step 1: Consumers to fuse box */}
              <li>
                <span className="font-semibold">{t("configurator.phase4Step1Title")}</span>
                <p className="text-muted-foreground mt-1 ml-5">{t("configurator.phase4Step1Desc")}</p>
              </li>

              {/* Step 2: MPPT (conditional) */}
              {calc.solarWp > 0 && (
                <li>
                  <span className="font-semibold">{t("configurator.phase4Step2Title")}</span>
                  <ol className="list-disc list-inside ml-5 mt-1 space-y-1 text-muted-foreground">
                    <li>{t("configurator.phase4Step2a")}</li>
                    <li>{t("configurator.phase4Step2b")}</li>
                    <li className="text-destructive font-medium">{t("configurator.phase4Step2c")}</li>
                  </ol>
                </li>
              )}

              {/* Step 3: Inverter (conditional) */}
              {calc.inverterW > 0 && (
                <li>
                  <span className="font-semibold">{t("configurator.phase4Step3Title")}</span>
                  <ol className="list-disc list-inside ml-5 mt-1 space-y-1 text-muted-foreground">
                    <li>{t("configurator.phase4Step3a")}</li>
                    <li>{t("configurator.phase4Step3b")}</li>
                    <li>{t("configurator.phase4Step3c")}</li>
                  </ol>
                </li>
              )}

              {/* Step 4: DC-DC */}
              <li>
                <span className="font-semibold">{t("configurator.phase4Step4Title")}</span>
                <ol className="list-disc list-inside ml-5 mt-1 space-y-1 text-muted-foreground">
                  <li>{t("configurator.phase4Step4a")}</li>
                  <li>{t("configurator.phase4Step4b")}</li>
                  <li>{t("configurator.phase4Step4c")}</li>
                </ol>
              </li>

              {/* Step 5: Battery (LAST) */}
              <li>
                <span className="font-semibold">{t("configurator.phase4Step5Title")}</span>
                <ol className="list-disc list-inside ml-5 mt-1 space-y-1 text-muted-foreground">
                  <li>{t("configurator.phase4Step5a")}</li>
                  <li>{t("configurator.phase4Step5b")}</li>
                  <li>{t("configurator.phase4Step5c")}</li>
                  <li>{t("configurator.phase4Step5d")}</li>
                  <li>{t("configurator.phase4Step5e")}</li>
                  <li>{t("configurator.phase4Step5f")}</li>
                </ol>
              </li>
            </ol>

            <DangerBlock text={t("configurator.phase4SparkWarning")} />

            <MaterialsBlock
              items={[
                t("configurator.toolMultimeter"),
                t("configurator.toolCrimpTool"),
                t("configurator.cableLugsCorrectSizes"),
                t("configurator.toolHeatShrink"),
                t("configurator.heatGun"),
              ]}
            />
            <PhaseCheckbox phase={4} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 5: TESTING ── */}
        <AccordionItem value="phase-5" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={5} difficulty="easy" time="1-2h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>{t("configurator.phase5Step1")}</li>
              <li>{t("configurator.phase5Step2")}</li>
              <li>{t("configurator.phase5Step3")}</li>
              {calc.inverterW > 0 && <li>{t("configurator.phase5Step4")}</li>}
              {calc.solarWp > 0 && <li>{t("configurator.phase5Step5")}</li>}
              <li>{t("configurator.phase5Step6")}</li>
              <li>{t("configurator.phase5Step7")}</li>
            </ol>
            <WarningBlock text={t("configurator.phase5Warning")} />
            <PhaseCheckbox phase={5} />
          </AccordionContent>
        </AccordionItem>

        {/* ── PHASE 6: FINISHING ── */}
        <AccordionItem value="phase-6" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <PhaseHeader phase={6} difficulty="easy" time="1-2h" />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>{t("configurator.phase6Step1")}</li>
              <li>{t("configurator.phase6Step2")}</li>
              <li>{t("configurator.phase6Step3")}</li>
              <li>{t("configurator.phase6Step4")}</li>
              <li>{t("configurator.phase6Step5")}</li>
              <li>{t("configurator.phase6Step6")}</li>
              {calc.inverterW > 0 && <li>{t("configurator.phase6Step7")}</li>}
              <li>{t("configurator.phase6Step8")}</li>
              <li>{t("configurator.phase6Step9")}</li>
            </ol>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t("configurator.keepInVan")}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>{t("configurator.keepSchema")}</li>
                <li>{t("configurator.keepFuses")}</li>
                <li>{t("configurator.keepMultimeter")}</li>
                <li>{t("configurator.keepTools")}</li>
              </ul>
            </div>
            <PhaseCheckbox phase={6} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ═══ Cabling Reference Table (collapsible) ═══ */}
      <Accordion type="multiple" className="mt-6">
        <AccordionItem value="cabling-ref" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2 font-semibold">
              <Cable className="w-5 h-5 text-primary" />
              {t("configurator.cablingOverview")}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 mb-4">
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm font-medium">
                {t("configurator.cableSafetyNote")}
              </AlertDescription>
            </Alert>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("configurator.cableFrom")} → {t("configurator.cableTo")}</TableHead>
                    <TableHead>{t("configurator.distance")}</TableHead>
                    <TableHead>{t("configurator.cableSize")}</TableHead>
                    <TableHead>{t("configurator.current")}</TableHead>
                    <TableHead>{t("configurator.fuse")}</TableHead>
                    <TableHead>{t("configurator.cableType")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cablingRows.map((row, i) => {
                    const finalSize = getCableForCircuit(row.circuitId, row.amps, row.distance, minSpecs);
                    const fuse = getFuseSpec(row.circuitId, { dcDcA: calc.dcDcA, inverterW: calc.inverterW });
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
                        <TableCell className="text-xs">{fuse ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.type}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Grounding points */}
            {groundingPoints && groundingPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("configurator.groundingSection")}
                </h4>
                <div className="space-y-2">
                  {groundingPoints.map((gp) => (
                    <div key={gp.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <CircleDot className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{gp.location}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                          {gp.bolt_size && <span>{t("configurator.boltSize")}: {gp.bolt_size}</span>}
                          {gp.max_cable_size_mm2 && <span>Max. {gp.max_cable_size_mm2} mm²</span>}
                          <Badge variant={gp.existing_ground ? "default" : "outline"} className="text-xs">
                            {gp.existing_ground ? t("configurator.existingGround") : t("configurator.needsDrilling")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Disclaimer */}
      <Card className="border-muted bg-muted/30 mt-6">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            ⚠️ {t("configurator.disclaimer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepInstallGuide;
