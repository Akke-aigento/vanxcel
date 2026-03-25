import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVehicleBrands = () =>
  useQuery({
    queryKey: ["vehicle-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("brand, id")
        .eq("is_active", true)
        .order("popularity_rank", { ascending: true });
      if (error) throw error;
      const brandMap = new Map<string, number>();
      data.forEach((v) => {
        brandMap.set(v.brand, (brandMap.get(v.brand) || 0) + 1);
      });
      return Array.from(brandMap.entries()).map(([brand, count]) => ({ brand, count }));
    },
  });

export const useVehiclesByBrand = (brand: string | null) =>
  useQuery({
    queryKey: ["vehicles-by-brand", brand],
    enabled: !!brand,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("brand", brand!)
        .eq("is_active", true)
        .order("production_year_start", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useBodyTypes = (vehicleId: string | null) =>
  useQuery({
    queryKey: ["body-types", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_body_types")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useMotorisations = (vehicleId: string | null, buildYear: number | null) =>
  useQuery({
    queryKey: ["motorisations", vehicleId, buildYear],
    enabled: !!vehicleId && !!buildYear,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_motorisations")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data.filter((m) => {
        const start = m.production_year_start ?? 0;
        const end = m.production_year_end ?? new Date().getFullYear();
        return buildYear! >= start && buildYear! <= end;
      });
    },
  });

export const useBatteryLocations = (vehicleId: string | null) =>
  useQuery({
    queryKey: ["battery-locations", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_battery_locations")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useCableRoutes = (vehicleId: string | null) =>
  useQuery({
    queryKey: ["cable-routes", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_cable_routes")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useGroundingPoints = (vehicleId: string | null) =>
  useQuery({
    queryKey: ["grounding-points", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_grounding_points")
        .select("*")
        .eq("vehicle_id", vehicleId!);
      if (error) throw error;
      return data;
    },
  });

export const useVehicleWarnings = (
  vehicleId: string | null,
  buildYear: number | null,
  engineCode: string | null
) =>
  useQuery({
    queryKey: ["vehicle-warnings", vehicleId, buildYear, engineCode],
    enabled: !!vehicleId && !!buildYear,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_warnings")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data.filter((w) => {
        const yearMatch =
          !w.affected_years ||
          w.affected_years.length === 0 ||
          w.affected_years.includes(buildYear!);
        const engineMatch =
          !w.affected_engines ||
          w.affected_engines.length === 0 ||
          w.affected_engines.some(
            (e) => e === "alle" || e === engineCode
          );
        return yearMatch && engineMatch;
      });
    },
  });
