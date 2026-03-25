import { useMotorisations } from "@/hooks/use-configurator";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  vehicleId: string;
  buildYear: number;
  onSelect: (m: Tables<"vehicle_motorisations">) => void;
  onBack: () => void;
  selected: string | null;
}

const emissionColor: Record<string, string> = {
  "Euro 5": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Euro 6": "bg-accent/20 text-accent border-accent/30",
  "Euro 6d": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Euro 6e": "bg-red-500/20 text-red-400 border-red-500/30",
};

const StepMotorisationSelect = ({ vehicleId, buildYear, onSelect, onBack, selected }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading } = useMotorisations(vehicleId, buildYear);
  const motors = data?.motors;
  const isFallback = data?.isFallback ?? false;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>
      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.selectEngine")}
      </h2>

      {isFallback && motors && motors.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border-2 border-orange-500/40 bg-orange-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-300">
              {t("configurator.fallbackMessage", { year: buildYear })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        {motors?.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-8">
            {t("configurator.noEngines")}
          </p>
        )}
        {motors?.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className={`relative p-5 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/60 ${
              selected === m.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-card/80"
            }`}
          >
            {selected === m.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-display text-xl text-foreground">
                {m.engine_family}
              </h3>
              <span className="text-sm text-muted-foreground">{m.power_hp}pk</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {m.emission_standard && (
                <Badge
                  variant="outline"
                  className={`text-xs border ${emissionColor[m.emission_standard] || ""}`}
                >
                  {m.emission_standard}
                </Badge>
              )}
              {m.has_smart_alternator ? (
                <Badge
                  variant="outline"
                  className="text-xs border bg-destructive/20 text-destructive border-destructive/30 gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Smart alternator
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1"
                >
                  <Zap className="w-3 h-3" />
                  {t("configurator.conventional")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("configurator.alternator")}: {m.alternator_rated_amps}–{m.alternator_max_amps}A
            </p>
            {m.notes && (
              <p className="text-xs text-muted-foreground/70 mt-2">{m.notes}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepMotorisationSelect;
