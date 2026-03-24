import type { ConfiguratorState } from "./ConfiguratorWizard";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  state: ConfiguratorState;
  onStepClick: (step: number) => void;
}

const usageLabelKeys: Record<string, string> = {
  weekend: "configurator.usageWeekend",
  regular: "configurator.usageRegular",
  fulltime: "configurator.usageFulltime",
  stealth: "configurator.usageStealth",
};

const climateLabelKeys: Record<string, string> = {
  benelux: "configurator.climateBenelux",
  southern_europe: "configurator.climateSouth",
  scandinavia: "configurator.climateNorth",
  all_season: "configurator.climateAll",
};

const VehicleSummaryBar = ({ state, onStepClick }: Props) => {
  const { t } = useTranslation();
  const crumbs: { label: string; step: number }[] = [];

  if (state.brand) {
    crumbs.push({ label: state.brand, step: 0 });
  }
  if (state.vehicle) {
    crumbs.push({
      label: `${state.vehicle.model} ${state.vehicle.generation}`,
      step: 1,
    });
  }
  if (state.bodyType) {
    crumbs.push({ label: state.bodyType.code, step: 2 });
  }
  if (state.buildYear) {
    crumbs.push({ label: String(state.buildYear), step: 3 });
  }
  if (state.motorisation) {
    const label = `${state.motorisation.engine_family} ${state.motorisation.power_hp ?? ""}pk`;
    crumbs.push({ label, step: 4 });
    if (state.motorisation.has_smart_alternator) {
      crumbs.push({ label: "⚡ Smart alt.", step: 4 });
    }
  }
  if (state.usageType && usageLabelKeys[state.usageType]) {
    crumbs.push({ label: t(usageLabelKeys[state.usageType]), step: 6 });
  }
  if (state.climate && climateLabelKeys[state.climate]) {
    crumbs.push({ label: t(climateLabelKeys[state.climate]), step: 7 });
  }
  if (state.persons) {
    const personsLabels: Record<number, string> = {
      1: t("configurator.persons1"),
      2: t("configurator.persons2"),
      4: t("configurator.persons34"),
      5: t("configurator.persons5"),
    };
    crumbs.push({ label: personsLabels[state.persons] ?? `${state.persons}`, step: 8 });
  }

  if (crumbs.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm bg-secondary/50 rounded-lg px-4 py-3 border border-border">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <button
            onClick={() => onStepClick(c.step)}
            className="text-foreground/80 hover:text-primary transition-colors"
          >
            {c.label}
          </button>
          {i < crumbs.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </span>
      ))}
    </div>
  );
};

export default VehicleSummaryBar;
