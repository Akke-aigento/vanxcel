import { useVehicleBrands } from "@/hooks/use-configurator";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Truck } from "lucide-react";

interface Props {
  onSelect: (brand: string) => void;
  selected: string | null;
}

const StepBrandSelect = ({ onSelect, selected }: Props) => {
  const { t } = useTranslation();
  const { data: brands, isLoading } = useVehicleBrands();

  return (
    <div>
      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.selectBrand")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        {brands?.map((b) => (
          <button
            key={b.brand}
            onClick={() => onSelect(b.brand)}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/60 ${
              selected === b.brand
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-card/80"
            }`}
          >
            {selected === b.brand && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <Truck className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-2xl text-foreground">{b.brand}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {b.count} {b.count === 1 ? "model" : t("configurator.models")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepBrandSelect;
