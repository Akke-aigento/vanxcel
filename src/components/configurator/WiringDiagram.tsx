import { useMemo, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Download } from "lucide-react";
import type { ConfiguratorState } from "./ConfiguratorWizard";

/* ── Types ── */
interface ComponentDef {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  phase: number;
  tooltip: string;
  shape?: "rect" | "circle";
  dashed?: boolean;
  visible?: boolean;
}

interface CableDef {
  id: string;
  from: string;
  to: string;
  color: string;
  thickness: number;
  label: string;
  dashed?: boolean;
  visible?: boolean;
  phase: number;
}

interface Props {
  state: ConfiguratorState;
  calc: {
    batteryAh: number;
    solarWp: number;
    inverterW: number;
    dcDcA: number;
  };
  topBatteryLocation: { location_id: string; label: string } | null;
  activePhase: string | null;
  onComponentClick: (phaseId: string) => void;
}

/* ── Color constants ── */
const C = {
  pos: "#ef4444",
  neg: "#3b82f6",
  solar: "#f59e0b",
  ac: "#a855f7",
  teal: "#008593",
  green: "#22c55e",
  grey: "#6b7280",
  darkRed: "#991b1b",
  darkGrey: "#374151",
  yellow: "#eab308",
  blue: "#3b82f6",
};

/* ── Bus shape dimensions per brand ── */
function getBusDims(brand: string | null) {
  if (brand === "Fiat" || brand === "Citroën" || brand === "Peugeot") {
    return { w: 700, h: 260, cabinW: 140, label: "L2H2" };
  }
  if (brand === "Mercedes-Benz") {
    return { w: 680, h: 250, cabinW: 135, label: "MWB" };
  }
  // VW T5/T6, Renault, Ford — compacter
  return { w: 580, h: 220, cabinW: 120, label: "" };
}

/* ── Main component ── */
const WiringDiagram = ({ state, calc, topBatteryLocation, activePhase, onComponentClick }: Props) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const bus = useMemo(() => getBusDims(state.vehicle?.brand ?? null), [state.vehicle?.brand]);

  const batteryRear = topBatteryLocation?.location_id === "garage_rear";
  const hasSolar = calc.solarWp > 0;
  const hasAC = calc.inverterW > 0;

  const svgW = bus.w + 60;
  const svgH = bus.h + 100;
  const ox = 30; // offset x
  const oy = 30; // offset y

  /* ── Component positions ── */
  const components = useMemo<ComponentDef[]>(() => {
    const starterLoc = state.motorisation?.starter_battery_location ?? "motorruimte";
    const starterX = ox + 20;
    const starterY = starterLoc.includes("passagier") ? oy + bus.h - 60 : oy + 30;

    const battX = batteryRear ? ox + bus.w - 120 : ox + bus.cabinW + 30;
    const battY = batteryRear ? oy + bus.h / 2 - 20 : oy + bus.h - 70;

    const convX = battX + 70;
    const convY = battY - 10;

    const anlX = battX + 50;
    const anlY = battY + 50;

    const switchX = anlX + 35;
    const switchY = anlY;

    const fuseBoxX = battX + 20;
    const fuseBoxY = battY - 55;

    const busbarX = battX - 10;
    const busbarY = battY + 45;

    const groundX = ox + bus.cabinW + 60;
    const groundY = oy + bus.h - 20;

    const shoreX = ox + bus.w - 30;
    const shoreY = oy + bus.h + 5;

    return [
      {
        id: "starter", label: "Starter", x: starterX, y: starterY, w: 50, h: 30,
        fill: C.grey, stroke: C.grey, phase: 3, shape: "rect",
        tooltip: `${t("configurator.cableStarterBattery")} — ${starterLoc}`,
      },
      {
        id: "converter", label: `VanXcel ${calc.inverterW}W`, x: convX, y: convY, w: 80, h: 50,
        fill: C.teal, stroke: C.teal, phase: 4,
        tooltip: `VanXcel 5-in-1 Converter — ${calc.inverterW}W`,
      },
      {
        id: "battery", label: `${calc.batteryAh}Ah`, x: battX, y: battY, w: 55, h: 35,
        fill: C.green, stroke: C.green, phase: 1,
        tooltip: `LiFePO4 ${calc.batteryAh}Ah — ${topBatteryLocation?.label ?? ""}`,
      },
      {
        id: "anl", label: "ANL", x: anlX, y: anlY, w: 22, h: 22,
        fill: C.pos, stroke: C.pos, phase: 1,
        tooltip: "ANL hoofdzekering",
      },
      {
        id: "switch", label: "⊘", x: switchX, y: switchY + 2, w: 18, h: 18,
        fill: C.pos, stroke: C.pos, phase: 1, shape: "circle",
        tooltip: "Batterij disconnect schakelaar",
      },
      {
        id: "fusebox", label: "Fuse box", x: fuseBoxX, y: fuseBoxY, w: 55, h: 25,
        fill: C.darkRed, stroke: C.darkRed, phase: 2,
        tooltip: t("configurator.cableFuseBox"),
      },
      {
        id: "busbar", label: "– Busbar", x: busbarX, y: busbarY, w: 50, h: 12,
        fill: C.darkGrey, stroke: C.darkGrey, phase: 2,
        tooltip: t("configurator.negativeBusbar"),
      },
      {
        id: "solar", label: `${calc.solarWp}Wp`, x: ox + bus.cabinW + 40, y: oy - 12, w: bus.w - bus.cabinW - 80, h: 20,
        fill: C.yellow, stroke: C.yellow, phase: 3, dashed: true,
        visible: hasSolar,
        tooltip: `Zonnepaneel ${calc.solarWp}Wp (op dak)`,
      },
      {
        id: "shore", label: "AC IN", x: shoreX, y: shoreY, w: 30, h: 20,
        fill: C.ac, stroke: C.ac, phase: 4,
        visible: hasAC,
        tooltip: "Walstroom inlaat (230V)",
      },
      {
        id: "ground", label: "⏚", x: groundX, y: groundY, w: 20, h: 16,
        fill: C.darkGrey, stroke: C.green, phase: 4,
        tooltip: "Chassis aardpunt",
      },
    ].filter((c) => c.visible !== false);
  }, [state, calc, topBatteryLocation, batteryRear, hasSolar, hasAC, bus, t, ox, oy]);

  /* helper: get center of component */
  const center = useCallback(
    (id: string) => {
      const c = components.find((comp) => comp.id === id);
      if (!c) return { cx: 0, cy: 0 };
      if (c.shape === "circle") return { cx: c.x, cy: c.y };
      return { cx: c.x + c.w / 2, cy: c.y + c.h / 2 };
    },
    [components]
  );

  /* ── Cable definitions ── */
  const cables = useMemo<CableDef[]>(() => {
    const list: CableDef[] = [
      // Starter → Converter (Anderson, 16mm²)
      { id: "starter-conv", from: "starter", to: "converter", color: C.pos, thickness: 2.5, label: "16mm²", phase: 3 },
      // Battery → ANL
      { id: "batt-anl", from: "battery", to: "anl", color: C.pos, thickness: 3, label: "25mm²", phase: 1 },
      // ANL → Switch
      { id: "anl-sw", from: "anl", to: "switch", color: C.pos, thickness: 3, label: "", phase: 1 },
      // Switch → Converter
      { id: "sw-conv", from: "switch", to: "converter", color: C.pos, thickness: 3, label: "16mm²", phase: 4 },
      // Converter → Battery (neg)
      { id: "conv-batt-neg", from: "converter", to: "busbar", color: C.neg, thickness: 2.5, label: "16mm²", phase: 4 },
      // Battery → Busbar (neg)
      { id: "batt-busbar", from: "battery", to: "busbar", color: C.neg, thickness: 2.5, label: "", phase: 1 },
      // Fusebox → Battery
      { id: "fuse-batt", from: "fusebox", to: "battery", color: C.pos, thickness: 2, label: "16mm²", phase: 2 },
      // Ground
      { id: "batt-gnd", from: "busbar", to: "ground", color: C.green, thickness: 2, label: "25mm²", phase: 4 },
    ];

    if (hasSolar) {
      list.push({
        id: "solar-conv", from: "solar", to: "converter", color: C.solar, thickness: 1.5,
        label: "MC4", phase: 3, dashed: false,
      });
    }

    if (hasAC) {
      list.push({
        id: "shore-conv", from: "shore", to: "converter", color: C.ac, thickness: 2,
        label: "230V", phase: 4,
      });
    }

    return list;
  }, [hasSolar, hasAC]);

  /* ── Phase highlight logic ── */
  const activePhaseNum = activePhase ? parseInt(activePhase.replace("phase-", ""), 10) : null;

  const getOpacity = useCallback(
    (phase: number) => {
      if (activePhaseNum === null) return 1;
      return phase === activePhaseNum ? 1 : 0.3;
    },
    [activePhaseNum]
  );

  const getPulse = useCallback(
    (phase: number) => {
      if (activePhaseNum === null) return false;
      return phase === activePhaseNum;
    },
    [activePhaseNum]
  );

  /* ── Download as image ── */
  const handleDownload = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = svgW * scale;
    canvas.height = svgH * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = "bedradingsschema.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [svgW, svgH]);

  /* ── Render SVG content (shared between normal & fullscreen) ── */
  const renderSVG = (w: number, h: number) => (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxHeight: "500px" }}
    >
      {/* Defs */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
            50% { filter: drop-shadow(0 0 12px currentColor); }
          }
          .comp-pulse { animation: pulse-glow 2s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── Bus body ── */}
      <rect
        x={ox} y={oy} width={bus.w} height={bus.h} rx={16} ry={16}
        fill="none" stroke="hsl(0 0% 40%)" strokeWidth={2}
      />
      {/* Cabin divider */}
      <line
        x1={ox + bus.cabinW} y1={oy + 4} x2={ox + bus.cabinW} y2={oy + bus.h - 4}
        stroke="hsl(0 0% 40%)" strokeWidth={1} strokeDasharray="6 4"
      />
      {/* Cabin label */}
      <text x={ox + bus.cabinW / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="hsl(0 0% 50%)">
        Cabine
      </text>
      {/* Cargo label */}
      <text x={ox + bus.cabinW + (bus.w - bus.cabinW) / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="hsl(0 0% 50%)">
        Laadruimte
      </text>

      {/* Wheels */}
      {[oy - 4, oy + bus.h - 8].map((wy, i) => (
        <g key={`wheel-l-${i}`}>
          <ellipse cx={ox + 45} cy={wy + 6} rx={20} ry={6} fill="hsl(0 0% 25%)" stroke="hsl(0 0% 35%)" />
        </g>
      ))}
      {[oy - 4, oy + bus.h - 8].map((wy, i) => (
        <g key={`wheel-r-${i}`}>
          <ellipse cx={ox + bus.w - 55} cy={wy + 6} rx={20} ry={6} fill="hsl(0 0% 25%)" stroke="hsl(0 0% 35%)" />
        </g>
      ))}

      {/* Sliding door (gap on bottom side) */}
      <line
        x1={ox + bus.cabinW + 20} y1={oy + bus.h}
        x2={ox + bus.cabinW + 100} y2={oy + bus.h}
        stroke="hsl(185 100% 29%)" strokeWidth={3} strokeLinecap="round"
      />
      <text x={ox + bus.cabinW + 60} y={oy + bus.h + 14} textAnchor="middle" fontSize={8} fill="hsl(0 0% 50%)">
        Schuifdeur
      </text>

      {/* Rear doors (dashed) */}
      <line
        x1={ox + bus.w} y1={oy + 20} x2={ox + bus.w} y2={oy + bus.h - 20}
        stroke="hsl(0 0% 40%)" strokeWidth={1.5} strokeDasharray="4 3"
      />

      {/* Vehicle label */}
      <text x={ox + bus.w / 2} y={oy - 10} textAnchor="middle" fontSize={13} fontWeight="bold" fill="hsl(0 0% 80%)">
        {state.vehicle?.brand ?? ""} {state.vehicle?.model ?? ""} {state.bodyType?.label ?? ""}
      </text>

      {/* ── Cables ── */}
      {cables.map((cable) => {
        const from = center(cable.from);
        const to = center(cable.to);
        const opacity = getOpacity(cable.phase);
        // Simple curved path
        const mx = (from.cx + to.cx) / 2;
        const my = (from.cy + to.cy) / 2 - 15;
        return (
          <g key={cable.id} opacity={opacity}>
            <Tooltip>
              <TooltipTrigger asChild>
                <path
                  d={`M ${from.cx} ${from.cy} Q ${mx} ${my} ${to.cx} ${to.cy}`}
                  fill="none"
                  stroke={cable.color}
                  strokeWidth={cable.thickness}
                  strokeDasharray={cable.dashed ? "6 3" : undefined}
                  strokeLinecap="round"
                  className="transition-opacity duration-300 cursor-pointer hover:brightness-150"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {cable.from} → {cable.to} — {cable.label}
              </TooltipContent>
            </Tooltip>
            {cable.label && (
              <text
                x={mx} y={my - 4}
                textAnchor="middle" fontSize={8} fill={cable.color}
                className="pointer-events-none"
              >
                {cable.label}
              </text>
            )}
          </g>
        );
      })}

      {/* ── Components ── */}
      {components.map((comp) => {
        const opacity = getOpacity(comp.phase);
        const pulse = getPulse(comp.phase);
        return (
          <g
            key={comp.id}
            opacity={opacity}
            className={`transition-opacity duration-300 cursor-pointer ${pulse ? "comp-pulse" : ""}`}
            style={{ color: comp.fill }}
            onClick={() => onComponentClick(`phase-${comp.phase}`)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  {comp.shape === "circle" ? (
                    <circle
                      cx={comp.x} cy={comp.y} r={comp.w / 2}
                      fill={comp.fill + "33"} stroke={comp.stroke} strokeWidth={1.5}
                      strokeDasharray={comp.dashed ? "4 2" : undefined}
                    />
                  ) : (
                    <rect
                      x={comp.x} y={comp.y} width={comp.w} height={comp.h} rx={4}
                      fill={comp.fill + "33"} stroke={comp.stroke} strokeWidth={1.5}
                      strokeDasharray={comp.dashed ? "4 2" : undefined}
                    />
                  )}
                  <text
                    x={comp.shape === "circle" ? comp.x : comp.x + comp.w / 2}
                    y={comp.shape === "circle" ? comp.y + 4 : comp.y + comp.h / 2 + 4}
                    textAnchor="middle" fontSize={comp.w > 60 ? 10 : 8}
                    fill="hsl(0 0% 90%)" fontWeight="600"
                    className="pointer-events-none select-none"
                  >
                    {comp.label}
                  </text>
                </g>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                {comp.tooltip}
              </TooltipContent>
            </Tooltip>
          </g>
        );
      })}
    </svg>
  );

  /* ── Legend data ── */
  const legendItems = [
    { color: C.pos, label: "12V+ (positief)" },
    { color: C.neg, label: "12V– (negatief)" },
    ...(hasSolar ? [{ color: C.solar, label: "Solar (MC4)" }] : []),
    ...(hasAC ? [{ color: C.ac, label: "230V AC" }] : []),
    { color: C.green, label: "Aarding" },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-8">
        {/* Title */}
        <h3 className="text-xl font-display font-bold tracking-tight mb-1 uppercase">
          Jouw Bedradingsschema
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Klik op een component voor installatie-instructies
        </p>

        {/* SVG container */}
        <div className="relative border border-border/50 rounded-xl bg-card/50 p-3 overflow-x-auto">
          {renderSVG(svgW, svgH)}

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur"
              onClick={() => setFullscreen(true)}
              aria-label="Volledig scherm"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur"
              onClick={handleDownload}
              aria-label="Download als afbeelding"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 px-1">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-4 h-1 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Fullscreen dialog */}
        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
            <DialogTitle className="sr-only">Bedradingsschema</DialogTitle>
            <div className="overflow-auto">
              {renderSVG(svgW, svgH)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default WiringDiagram;
