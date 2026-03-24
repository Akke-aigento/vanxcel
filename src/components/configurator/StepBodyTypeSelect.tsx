import { useBodyTypes } from "@/hooks/use-configurator";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  vehicleId: string;
  onSelect: (bt: Tables<"vehicle_body_types">) => void;
  onBack: () => void;
  selected: string | null;
}

const suitabilityColor: Record<string, string> = {
  beperkt: "bg-destructive/20 text-destructive border-destructive/30",
  goed: "bg-accent/20 text-accent border-accent/30",
  uitstekend: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const StepBodyTypeSelect = ({ vehicleId, onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();
  const { data: bodyTypes, isLoading } = useBodyTypes(vehicleId);

  const bestSuitability = bodyTypes?.reduce((best, bt) => {
    if (bt.campervan_suitability === "uitstekend") return "uitstekend";
    if (bt.campervan_suitability === "goed" && best !== "uitstekend") return "goed";
    return best;
  }, "beperkt");

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.selectBody")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        {bodyTypes?.map((bt) => {
          const isRecommended = bt.campervan_suitability === bestSuitability;
          return (
            <button
              key={bt.id}
              onClick={() => onSelect(bt)}
              className={`relative p-5 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/60 ${
                selected === bt.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:bg-card/80"
              }`}
            >
              {selected === bt.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              {isRecommended && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-accent">
                  <Star className="w-3 h-3 fill-accent" />
                  {t("configurator.recommended")}
                </div>
              )}
              <h3 className="font-display text-xl text-foreground">
                {bt.code} — {bt.label}
              </h3>
              {bt.campervan_suitability && (
                <Badge
                  className={`mt-2 text-xs border ${suitabilityColor[bt.campervan_suitability] || ""}`}
                  variant="outline"
                >
                  {bt.campervan_suitability}
                </Badge>
              )}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                <div>
                  <span className="block text-foreground/70 font-medium">
                    {t("configurator.interior")}
                  </span>
                  {bt.cargo_length_mm && bt.cargo_width_mm && bt.internal_height_mm
                    ? `${bt.cargo_length_mm}×${bt.cargo_width_mm}×${bt.internal_height_mm}mm`
                    : "—"}
                </div>
                <div>
                  <span className="block text-foreground/70 font-medium">
                    {t("configurator.volume")}
                  </span>
                  {bt.cargo_volume_m3 ? `${bt.cargo_volume_m3} m³` : "—"}
                </div>
                <div>
                  <span className="block text-foreground/70 font-medium">
                    {t("configurator.payload")}
                  </span>
                  {bt.max_payload_kg ? `${bt.max_payload_kg} kg` : "—"}
                </div>
              </div>
              {bt.campervan_notes && (
                <p className="text-xs text-muted-foreground mt-3">{bt.campervan_notes}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepBodyTypeSelect;
