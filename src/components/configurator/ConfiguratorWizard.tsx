import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import VehicleSummaryBar from "./VehicleSummaryBar";
import StepBrandSelect from "./StepBrandSelect";
import StepModelSelect from "./StepModelSelect";
import StepBodyTypeSelect from "./StepBodyTypeSelect";
import StepBuildYear from "./StepBuildYear";
import StepMotorisationSelect from "./StepMotorisationSelect";
import StepWarnings from "./StepWarnings";
import StepUsageType from "./StepUsageType";
import StepClimate from "./StepClimate";
import StepPersons from "./StepPersons";
import StepAppliances from "./StepAppliances";
import StepResults from "./StepResults";
import StepPackage from "./StepPackage";
import StepInstallGuide from "./StepInstallGuide";
import StepOtherVehicle from "./StepOtherVehicle";
import type { SelectedAppliance } from "./StepAppliances";
import type { Tables } from "@/integrations/supabase/types";

export interface ConfiguratorState {
  brand: string | null;
  vehicleId: string | null;
  vehicle: Tables<"vehicles"> | null;
  bodyTypeId: string | null;
  bodyType: Tables<"vehicle_body_types"> | null;
  buildYear: number | null;
  motorisationId: string | null;
  motorisation: Tables<"vehicle_motorisations"> | null;
  usageType: string | null;
  climate: string | null;
  persons: number | null;
  selectedAppliances: SelectedAppliance[];
  totalDailyWh: number;
  subStep: number;
  isOtherVehicle: boolean;
  otherSmartAlternator: "yes" | "no" | "unknown" | null;
  otherVoltage: "12v" | "24v" | null;
  otherSize: "small" | "medium" | "large" | "xlarge" | null;
}

const initialState: ConfiguratorState = {
  brand: null,
  vehicleId: null,
  vehicle: null,
  bodyTypeId: null,
  bodyType: null,
  buildYear: null,
  motorisationId: null,
  motorisation: null,
  usageType: null,
  climate: null,
  persons: null,
  selectedAppliances: [],
  totalDailyWh: 0,
  subStep: 0,
  isOtherVehicle: false,
  otherSmartAlternator: null,
  otherVoltage: null,
  otherSize: null,
};

const ConfiguratorWizard = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfiguratorState>(initialState);

  const goTo = useCallback((step: number) => {
    setState((s) => ({ ...s, subStep: step }));
  }, []);

  const selectBrand = useCallback((brand: string) => {
    if (brand === "__other__") {
      setState((s) => ({
        ...s,
        brand: "__other__",
        isOtherVehicle: true,
        vehicleId: null,
        vehicle: null,
        bodyTypeId: null,
        bodyType: null,
        buildYear: null,
        motorisationId: null,
        motorisation: null,
        usageType: null,
        climate: null,
        persons: null,
        subStep: 1,
      }));
    } else {
      setState((s) => ({
        ...s,
        brand,
        isOtherVehicle: false,
        vehicleId: null,
        vehicle: null,
        bodyTypeId: null,
        bodyType: null,
        buildYear: null,
        motorisationId: null,
        motorisation: null,
        usageType: null,
        climate: null,
        persons: null,
        subStep: 1,
      }));
    }
  }, []);

  const completeOtherVehicle = useCallback((data: { smartAlternator: "yes" | "no" | "unknown"; voltage: "12v" | "24v"; size: "small" | "medium" | "large" | "xlarge" }) => {
    setState((s) => ({
      ...s,
      otherSmartAlternator: data.smartAlternator,
      otherVoltage: data.voltage,
      otherSize: data.size,
      subStep: 6,
    }));
  }, []);

  const selectVehicle = useCallback((vehicle: Tables<"vehicles">) => {
    setState((s) => ({
      ...s,
      vehicleId: vehicle.id,
      vehicle,
      bodyTypeId: null,
      bodyType: null,
      buildYear: null,
      motorisationId: null,
      motorisation: null,
      subStep: 2,
    }));
  }, []);

  const selectBodyType = useCallback((bt: Tables<"vehicle_body_types">) => {
    setState((s) => ({
      ...s,
      bodyTypeId: bt.id,
      bodyType: bt,
      subStep: 3,
    }));
  }, []);

  const selectBuildYear = useCallback((year: number) => {
    setState((s) => ({
      ...s,
      buildYear: year,
      motorisationId: null,
      motorisation: null,
      subStep: 4,
    }));
  }, []);

  const selectMotorisation = useCallback((m: Tables<"vehicle_motorisations">) => {
    setState((s) => ({
      ...s,
      motorisationId: m.id,
      motorisation: m,
      subStep: 5,
    }));
  }, []);

  const selectUsageType = useCallback((usageType: string) => {
    setState((s) => ({ ...s, usageType, subStep: 7 }));
  }, []);

  const selectClimate = useCallback((climate: string) => {
    setState((s) => ({ ...s, climate, subStep: 8 }));
  }, []);

  const selectPersons = useCallback((persons: number) => {
    setState((s) => ({ ...s, persons, subStep: 9 }));
  }, []);

  const completeAppliances = useCallback((appliances: SelectedAppliance[], totalWh: number) => {
    setState((s) => ({ ...s, selectedAppliances: appliances, totalDailyWh: totalWh, subStep: 10 }));
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.subStep >= 10) {
        // Big steps: scroll to page top so title + summary bar are visible
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (contentRef.current) {
        // Input steps: scroll to just above the content area
        const top = contentRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [state.subStep]);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      <VehicleSummaryBar state={state} onStepClick={goTo} />

      <div className="mt-8" ref={contentRef}>
        {state.subStep === 0 && (
          <div className="animate-fade-in-up">
            <StepBrandSelect onSelect={selectBrand} selected={state.brand} />
          </div>
        )}
        {state.subStep === 1 && !state.isOtherVehicle && (
          <div className="animate-fade-in-up">
            <StepModelSelect
              brand={state.brand!}
              onSelect={selectVehicle}
              onBack={() => goTo(0)}
              selected={state.vehicleId}
            />
          </div>
        )}
        {state.subStep === 1 && state.isOtherVehicle && (
          <div className="animate-fade-in-up">
            <StepOtherVehicle
              onComplete={completeOtherVehicle}
              onBack={() => goTo(0)}
            />
          </div>
        )}
        {state.subStep === 2 && (
          <div className="animate-fade-in-up">
            <StepBodyTypeSelect
              vehicleId={state.vehicleId!}
              onSelect={selectBodyType}
              onBack={() => goTo(1)}
              selected={state.bodyTypeId}
            />
          </div>
        )}
        {state.subStep === 3 && (
          <div className="animate-fade-in-up">
            <StepBuildYear
              vehicle={state.vehicle!}
              onSelect={selectBuildYear}
              onBack={() => goTo(2)}
              selected={state.buildYear}
            />
          </div>
        )}
        {state.subStep === 4 && (
          <div className="animate-fade-in-up">
            <StepMotorisationSelect
              vehicleId={state.vehicleId!}
              buildYear={state.buildYear!}
              onSelect={selectMotorisation}
              onBack={() => goTo(3)}
              selected={state.motorisationId}
            />
          </div>
        )}
        {state.subStep === 5 && (
          <div className="animate-fade-in-up">
            <StepWarnings
              vehicleId={state.vehicleId!}
              buildYear={state.buildYear!}
              engineCode={state.motorisation?.engine_code ?? null}
              motorisation={state.motorisation}
              onBack={() => goTo(4)}
            />
            <div className="mt-8 text-center">
              <Button size="lg" className="btn-shimmer gap-2" onClick={() => goTo(6)}>
                {t("configurator.nextStep")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Usage & Lifestyle */}
        {state.subStep === 6 && (
          <div className="animate-fade-in-up">
            <StepUsageType
              onSelect={selectUsageType}
              onBack={() => goTo(5)}
              selected={state.usageType}
            />
          </div>
        )}
        {state.subStep === 7 && (
          <div className="animate-fade-in-up">
            <StepClimate
              onSelect={selectClimate}
              onBack={() => goTo(6)}
              selected={state.climate}
            />
          </div>
        )}
        {state.subStep === 8 && (
          <div className="animate-fade-in-up">
            <StepPersons
              onSelect={selectPersons}
              onBack={() => goTo(7)}
              selected={state.persons}
            />
          </div>
        )}
        {/* Step 3: Appliances */}
        {state.subStep === 9 && (
          <div className="animate-fade-in-up">
            <StepAppliances
              usageType={state.usageType}
              onComplete={completeAppliances}
              onBack={() => goTo(8)}
            />
          </div>
        )}

        {/* Step 4: Results */}
        {state.subStep === 10 && (
          <div className="animate-fade-in-up">
            <StepResults
              state={state}
              onBack={() => goTo(9)}
              onAdjustAppliances={() => goTo(9)}
              onNext={() => goTo(11)}
            />
          </div>
        )}
        {state.subStep === 11 && (
          <div className="animate-fade-in-up">
            <StepPackage
              state={state}
              onBack={() => goTo(10)}
              onNext={() => goTo(12)}
            />
          </div>
        )}
        {state.subStep === 12 && (
          <div className="animate-fade-in-up">
            <StepInstallGuide
              state={state}
              onBack={() => goTo(11)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguratorWizard;
