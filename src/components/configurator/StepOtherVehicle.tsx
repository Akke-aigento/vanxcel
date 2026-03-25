import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, HelpCircle, AlertTriangle, Zap } from "lucide-react";

interface OtherVehicleData {
  smartAlternator: "yes" | "no" | "unknown";
  voltage: "12v" | "24v";
  size: "small" | "medium" | "large" | "xlarge";
}

interface Props {
  onComplete: (data: OtherVehicleData) => void;
  onBack: () => void;
}

const StepOtherVehicle = ({ onComplete, onBack }: Props) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [smartAlt, setSmartAlt] = useState<"yes" | "no" | "unknown" | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [voltage, setVoltage] = useState<"12v" | "24v" | null>(null);
  const [size, setSize] = useState<"small" | "medium" | "large" | "xlarge" | null>(null);

  const handleFinish = (selectedSize: typeof size) => {
    if (smartAlt && voltage && selectedSize) {
      onComplete({
        smartAlternator: smartAlt,
        voltage,
        size: selectedSize,
      });
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={step === 0 ? onBack : () => setStep(step - 1)} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("configurator.back")}
      </Button>

      {step === 0 && (
        <div className="animate-fade-in-up">
          <h2 className="font-display text-3xl text-foreground mb-2">
            {t("configurator.otherSmartAltQuestion")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("configurator.otherSmartAltHint")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["yes", "no", "unknown"] as const).map((val) => (
              <button
                key={val}
                onClick={() => {
                  setSmartAlt(val);
                  if (val === "unknown") {
                    setShowHelp(true);
                  } else {
                    setShowHelp(false);
                    setStep(1);
                  }
                }}
                className={`p-5 rounded-lg border-2 transition-all text-left hover:border-primary/60 ${
                  smartAlt === val ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {val === "yes" && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                  {val === "no" && <Zap className="w-5 h-5 text-emerald-400" />}
                  {val === "unknown" && <HelpCircle className="w-5 h-5 text-muted-foreground" />}
                  <h3 className="font-display text-lg text-foreground">
                    {t(`configurator.otherSmartAlt_${val}`)}
                  </h3>
                </div>
              </button>
            ))}
          </div>
          {showHelp && (
            <div className="mt-6 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <h4 className="font-display text-lg text-foreground mb-2">
                {t("configurator.otherSmartAltHelpTitle")}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {t("configurator.otherSmartAltHelpText")}
              </p>
              <Button className="mt-4 gap-2" onClick={() => { setStep(1); }}>
                {t("configurator.nextStep")} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in-up">
          <h2 className="font-display text-3xl text-foreground mb-2">
            {t("configurator.otherVoltageQuestion")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("configurator.otherVoltageHint")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["12v", "24v"] as const).map((val) => (
              <button
                key={val}
                onClick={() => {
                  setVoltage(val);
                  setStep(2);
                }}
                className={`p-5 rounded-lg border-2 transition-all text-left hover:border-primary/60 ${
                  voltage === val ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <h3 className="font-display text-2xl text-foreground">{val.toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`configurator.otherVoltage_${val}`)}
                </p>
              </button>
            ))}
          </div>
          {voltage === "24v" && (
            <div className="mt-4 p-4 rounded-lg border-2 border-destructive/40 bg-destructive/10">
              <p className="text-sm text-destructive">{t("configurator.other24vWarning")}</p>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up">
          <h2 className="font-display text-3xl text-foreground mb-2">
            {t("configurator.otherSizeQuestion")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("configurator.otherSizeHint")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["small", "medium", "large", "xlarge"] as const).map((val) => (
              <button
                key={val}
                onClick={() => {
                  setSize(val);
                  handleFinish(val);
                }}
                className={`p-5 rounded-lg border-2 transition-all text-left hover:border-primary/60 ${
                  size === val ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <h3 className="font-display text-lg text-foreground">
                  {t(`configurator.otherSize_${val}`)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`configurator.otherSizeDesc_${val}`)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepOtherVehicle;
