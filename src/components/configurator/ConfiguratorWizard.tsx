import { useState, useCallback } from "react";
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
  subStep: number;
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
  subStep: 0,
};

const ConfiguratorWizard = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfiguratorState>(initialState);

  const goTo = useCallback((step: number) => {
    setState((s) => ({ ...s, subStep: step }));
  }, []);

  const selectBrand = useCallback((brand: string) => {
    setState((s) => ({
      ...s,
      brand,
      vehicleId: null,
      vehicle: null,
      bodyTypeId: null,
      bodyType: null,
      buildYear: null,
      motorisationId: null,
      motorisation: null,
      subStep: 1,
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

  const isComplete =
    state.brand &&
    state.vehicleId &&
    state.bodyTypeId &&
    state.buildYear &&
    state.motorisationId;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      <VehicleSummaryBar state={state} onStepClick={goTo} />

      <div className="mt-8">
        {state.subStep === 0 && (
          <div className="animate-fade-in-up">
            <StepBrandSelect onSelect={selectBrand} selected={state.brand} />
          </div>
        )}
        {state.subStep === 1 && (
          <div className="animate-fade-in-up">
            <StepModelSelect
              brand={state.brand!}
              onSelect={selectVehicle}
              onBack={() => goTo(0)}
              selected={state.vehicleId}
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
            {isComplete && (
              <div className="mt-8 text-center">
                <Button size="lg" className="btn-shimmer gap-2">
                  {t("configurator.nextStep")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguratorWizard;
