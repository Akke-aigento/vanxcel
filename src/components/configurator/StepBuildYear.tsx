import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  vehicle: Tables<"vehicles">;
  onSelect: (year: number) => void;
  onBack: () => void;
  selected: number | null;
}

const StepBuildYear = ({ vehicle, onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();
  const min = vehicle.production_year_start;
  const max = vehicle.production_year_end ?? new Date().getFullYear();
  const [year, setYear] = useState(selected ?? max);

  useEffect(() => {
    if (selected) setYear(selected);
  }, [selected]);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.selectYear")}
      </h2>
      <div className="max-w-md mx-auto text-center">
        <p className="font-display text-7xl text-primary mb-8">{year}</p>
        <Slider
          min={min}
          max={max}
          step={1}
          value={[year]}
          onValueChange={([v]) => setYear(v)}
          className="mb-6"
        />
        <div className="flex justify-between text-sm text-muted-foreground mb-8">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <Button onClick={() => onSelect(year)} size="lg" className="btn-shimmer">
          {t("configurator.confirmYear")}
        </Button>
      </div>
    </div>
  );
};

export default StepBuildYear;
