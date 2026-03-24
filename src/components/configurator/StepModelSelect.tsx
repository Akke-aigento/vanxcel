import { useVehiclesByBrand } from "@/hooks/use-configurator";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  brand: string;
  onSelect: (vehicle: Tables<"vehicles">) => void;
  onBack: () => void;
  selected: string | null;
}

const StepModelSelect = ({ brand, onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();
  const { data: vehicles, isLoading } = useVehiclesByBrand(brand);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.selectModel")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        {vehicles?.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/60 ${
              selected === v.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-card/80"
            }`}
          >
            {selected === v.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <h3 className="font-display text-2xl text-foreground">
              {v.model} {v.generation}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{v.generation_label}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {v.production_year_start}–{v.production_year_end ?? t("configurator.present")}
            </p>
            {v.platform_shared_with && v.platform_shared_with.length > 0 && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t("configurator.alsoKnownAs")}: {v.platform_shared_with.join(", ")}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepModelSelect;
