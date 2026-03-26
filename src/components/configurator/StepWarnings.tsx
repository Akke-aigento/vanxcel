import { useVehicleWarnings } from "@/hooks/use-configurator";
import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getLocalized, getLangFromI18n } from "@/lib/configurator-i18n";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  vehicleId: string;
  buildYear: number;
  engineCode: string | null;
  motorisation: Tables<"vehicle_motorisations"> | null;
  onBack: () => void;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    className: "border-destructive/50 bg-destructive/10 [&>svg]:text-destructive",
  },
  warning: {
    icon: AlertCircle,
    className: "border-accent/50 bg-accent/10 [&>svg]:text-accent",
  },
  info: {
    icon: Info,
    className: "border-primary/50 bg-primary/10 [&>svg]:text-primary",
  },
};

const StepWarnings = ({ vehicleId, buildYear, engineCode, motorisation, onBack }: Props) => {
  const { t } = useTranslation();
  const { data: warnings } = useVehicleWarnings(vehicleId, buildYear, engineCode);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>

      {motorisation?.has_smart_alternator && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-foreground font-display text-lg">
            {t("configurator.smartAlternatorTitle")}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm">
            {t("configurator.smartAlternatorDesc")}
          </AlertDescription>
        </Alert>
      )}

      <h2 className="font-display text-3xl text-foreground mb-6">
        {t("configurator.warnings")}
      </h2>

      {warnings && warnings.length === 0 && (
        <p className="text-muted-foreground text-center py-4">
          {t("configurator.noWarnings")}
        </p>
      )}

      <div className="space-y-4">
        {warnings?.map((w) => {
          const config = severityConfig[w.severity as keyof typeof severityConfig] || severityConfig.info;
          const Icon = config.icon;
          return (
            <Alert key={w.id} className={config.className}>
              <Icon className="h-5 w-5" />
              <AlertTitle className="text-foreground font-display text-lg">
                {w.title}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm mt-1">
                {w.description}
              </AlertDescription>
              {w.solution && (
                <p className="text-sm text-foreground/80 mt-2 font-medium">
                  💡 {w.solution}
                </p>
              )}
            </Alert>
          );
        })}
      </div>
    </div>
  );
};

export default StepWarnings;
