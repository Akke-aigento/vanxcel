import { useTranslation } from "react-i18next";
import { Tent, Compass, Home, EyeOff, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const options = [
  { value: "weekend", icon: Tent },
  { value: "regular", icon: Compass },
  { value: "fulltime", icon: Home },
  { value: "stealth", icon: EyeOff },
] as const;

interface Props {
  onSelect: (value: string) => void;
  onBack: () => void;
  selected: string | null;
}

const StepUsageType = ({ onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();

  const labels: Record<string, { name: string; desc: string }> = {
    weekend: { name: t("configurator.usageWeekend"), desc: t("configurator.usageWeekendDesc") },
    regular: { name: t("configurator.usageRegular"), desc: t("configurator.usageRegularDesc") },
    fulltime: { name: t("configurator.usageFulltime"), desc: t("configurator.usageFulltimeDesc") },
    stealth: { name: t("configurator.usageStealth"), desc: t("configurator.usageStealthDesc") },
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-2xl text-foreground mb-6">
        {t("configurator.usageTitle")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(({ value, icon: Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`relative text-left p-6 rounded-xl border-2 transition-all hover:border-primary/50 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground text-lg">{labels[value].name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{labels[value].desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepUsageType;
