-- =============================================
-- Campervan Configurator — Schema Migration
-- =============================================

-- 1. vehicles
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  generation text NOT NULL,
  generation_label text NOT NULL,
  production_year_start int4 NOT NULL,
  production_year_end int4,
  platform_shared_with text[],
  popularity_rank int4 DEFAULT 10,
  popularity_notes text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (brand, model, generation)
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicles" ON public.vehicles FOR SELECT USING (true);

-- 2. vehicle_body_types
CREATE TABLE public.vehicle_body_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  wheelbase_mm int4,
  total_length_mm int4,
  total_width_mm int4,
  total_height_mm int4,
  internal_height_mm int4,
  cargo_length_mm int4,
  cargo_width_mm int4,
  cargo_width_wheelarches_mm int4,
  cargo_volume_m3 numeric,
  gross_vehicle_weight_kg int4,
  max_payload_kg int4,
  campervan_suitability text,
  campervan_notes text,
  roof_type text,
  max_roof_load_kg int4,
  solar_max_area_m2 numeric,
  solar_max_length_mm int4,
  solar_max_width_mm int4,
  sort_order int4 DEFAULT 0,
  UNIQUE (vehicle_id, code)
);
ALTER TABLE public.vehicle_body_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_body_types" ON public.vehicle_body_types FOR SELECT USING (true);

-- 3. vehicle_motorisations
CREATE TABLE public.vehicle_motorisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  engine_code text NOT NULL,
  engine_family text NOT NULL,
  fuel_type text DEFAULT 'diesel',
  displacement_cc int4,
  power_kw int4,
  power_hp int4,
  torque_nm int4,
  transmission text,
  transmission_options text[],
  emission_standard text,
  production_year_start int4,
  production_year_end int4,
  alternator_type text NOT NULL,
  alternator_rated_amps int4,
  alternator_max_amps int4,
  alternator_voltage_min numeric,
  alternator_voltage_max numeric,
  smart_alternator_behavior text,
  smart_alternator_workaround text,
  starter_battery_type text,
  starter_battery_ah int4,
  starter_battery_location text,
  has_smart_alternator boolean DEFAULT false,
  has_start_stop boolean DEFAULT false,
  has_brake_regen boolean DEFAULT false,
  has_bms_shunt boolean DEFAULT false,
  bms_shunt_location text,
  can_bus_type text,
  fuel_consumption_l100km numeric,
  idle_rpm int4,
  charging_at_idle_amps int4,
  notes text,
  sort_order int4 DEFAULT 0,
  UNIQUE (vehicle_id, engine_code)
);
ALTER TABLE public.vehicle_motorisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_motorisations" ON public.vehicle_motorisations FOR SELECT USING (true);

-- 4. vehicle_battery_locations
CREATE TABLE public.vehicle_battery_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  location_id text NOT NULL,
  label text NOT NULL,
  max_length_mm int4,
  max_width_mm int4,
  max_height_mm int4,
  max_weight_kg int4,
  ventilation text,
  accessibility text,
  temperature_exposure text,
  mounting_notes text,
  popularity int4 DEFAULT 3,
  is_for_selfbuild boolean DEFAULT true,
  selfbuild_notes text,
  sort_order int4 DEFAULT 0,
  UNIQUE (vehicle_id, location_id)
);
ALTER TABLE public.vehicle_battery_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_battery_locations" ON public.vehicle_battery_locations FOR SELECT USING (true);

-- 5. vehicle_cable_routes
CREATE TABLE public.vehicle_cable_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  route_id text NOT NULL,
  label text NOT NULL,
  description text,
  distance_meters numeric,
  difficulty text,
  tools_required text[],
  hazards text[],
  cable_protection text,
  cable_size_for_20a int4,
  cable_size_for_30a int4,
  cable_size_for_50a int4,
  cable_size_for_80a int4,
  voltage_drop_notes text,
  sort_order int4 DEFAULT 0,
  UNIQUE (vehicle_id, route_id)
);
ALTER TABLE public.vehicle_cable_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_cable_routes" ON public.vehicle_cable_routes FOR SELECT USING (true);

-- 6. vehicle_grounding_points
CREATE TABLE public.vehicle_grounding_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  location text NOT NULL,
  bolt_size text,
  existing_ground boolean DEFAULT false,
  quality text,
  max_cable_size_mm2 int4,
  notes text
);
ALTER TABLE public.vehicle_grounding_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_grounding_points" ON public.vehicle_grounding_points FOR SELECT USING (true);

-- 7. vehicle_warnings
CREATE TABLE public.vehicle_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  severity text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  affected_years int4[],
  affected_engines text[],
  solution text,
  source text,
  sort_order int4 DEFAULT 0
);
ALTER TABLE public.vehicle_warnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_warnings" ON public.vehicle_warnings FOR SELECT USING (true);

-- 8. vehicle_popular_configs
CREATE TABLE public.vehicle_popular_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  config_name text NOT NULL,
  use_case text,
  typical_body text,
  battery_capacity_ah int4,
  battery_type text,
  solar_wp int4,
  inverter_w int4,
  dc_dc_charger_a int4,
  shore_power_charger_a int4,
  daily_consumption_wh int4,
  estimated_days_autark int4,
  budget_min_eur int4,
  budget_max_eur int4,
  recommended_products text[],
  sort_order int4 DEFAULT 0
);
ALTER TABLE public.vehicle_popular_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle_popular_configs" ON public.vehicle_popular_configs FOR SELECT USING (true);

-- 9. appliances
CREATE TABLE public.appliances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  name_nl text NOT NULL,
  wattage_typical int4 NOT NULL,
  wattage_peak int4,
  daily_hours_typical numeric,
  daily_wh_typical int4,
  voltage text DEFAULT '12v',
  requires_inverter boolean DEFAULT false,
  is_essential boolean DEFAULT false,
  popularity int4 DEFAULT 3,
  icon text,
  notes text,
  sort_order int4 DEFAULT 0
);
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read appliances" ON public.appliances FOR SELECT USING (true);

-- 10. configurator_sessions
CREATE TABLE public.configurator_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id),
  body_type_id uuid REFERENCES public.vehicle_body_types(id),
  motorisation_id uuid REFERENCES public.vehicle_motorisations(id),
  build_year int4,
  usage_type text,
  climate text,
  persons int4 DEFAULT 2,
  selected_appliances jsonb DEFAULT '[]',
  total_daily_wh int4,
  recommended_battery_ah int4,
  recommended_solar_wp int4,
  recommended_inverter_w int4,
  recommended_dc_dc_a int4,
  recommended_products jsonb DEFAULT '[]',
  total_price_eur numeric,
  status text DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.configurator_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert configurator_sessions" ON public.configurator_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select configurator_sessions" ON public.configurator_sessions FOR SELECT USING (true);
CREATE POLICY "Public update configurator_sessions" ON public.configurator_sessions FOR UPDATE USING (true);