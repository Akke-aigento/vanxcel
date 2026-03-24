import { useTranslation } from "react-i18next";
import { User, Users, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const options = [
  { value: 1, icon: User },
  { value: 2, icon: Users },
  { value: 4, icon: Users },
  { value: 5, icon: Users },
] as const;

interface Props {
  onSelect: (value: number) => void;
  onBack: () => void;
  selected: number | null;
}

const StepPersons = ({ onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();

  const labels: Record<number, string> = {
    1: t("configurator.persons1"),
    2: t("configurator.persons2"),
    4: t("configurator.persons34"),
    5: t("configurator.persons5"),
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-2xl text-foreground mb-6">
        {t("configurator.personsTitle")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {options.map(({ value, icon: Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover:border-primary/50 ${
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
              <span className="font-semibold text-foreground">{labels[value]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepPersons;
