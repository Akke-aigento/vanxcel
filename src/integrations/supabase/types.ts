export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appliances: {
        Row: {
          category: string
          daily_hours_typical: number | null
          daily_wh_typical: number | null
          icon: string | null
          id: string
          is_essential: boolean | null
          name: string
          name_de: string | null
          name_en: string | null
          name_fr: string | null
          name_nl: string
          notes: string | null
          popularity: number | null
          requires_inverter: boolean | null
          sort_order: number | null
          voltage: string | null
          wattage_peak: number | null
          wattage_typical: number
        }
        Insert: {
          category: string
          daily_hours_typical?: number | null
          daily_wh_typical?: number | null
          icon?: string | null
          id?: string
          is_essential?: boolean | null
          name: string
          name_de?: string | null
          name_en?: string | null
          name_fr?: string | null
          name_nl: string
          notes?: string | null
          popularity?: number | null
          requires_inverter?: boolean | null
          sort_order?: number | null
          voltage?: string | null
          wattage_peak?: number | null
          wattage_typical: number
        }
        Update: {
          category?: string
          daily_hours_typical?: number | null
          daily_wh_typical?: number | null
          icon?: string | null
          id?: string
          is_essential?: boolean | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          name_fr?: string | null
          name_nl?: string
          notes?: string | null
          popularity?: number | null
          requires_inverter?: boolean | null
          sort_order?: number | null
          voltage?: string | null
          wattage_peak?: number | null
          wattage_typical?: number
        }
        Relationships: []
      }
      configurator_sessions: {
        Row: {
          body_type_id: string | null
          build_year: number | null
          climate: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          motorisation_id: string | null
          persons: number | null
          recommended_battery_ah: number | null
          recommended_dc_dc_a: number | null
          recommended_inverter_w: number | null
          recommended_products: Json | null
          recommended_solar_wp: number | null
          selected_appliances: Json | null
          session_token: string
          status: string | null
          total_daily_wh: number | null
          total_price_eur: number | null
          updated_at: string | null
          usage_type: string | null
          vehicle_id: string | null
        }
        Insert: {
          body_type_id?: string | null
          build_year?: number | null
          climate?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          motorisation_id?: string | null
          persons?: number | null
          recommended_battery_ah?: number | null
          recommended_dc_dc_a?: number | null
          recommended_inverter_w?: number | null
          recommended_products?: Json | null
          recommended_solar_wp?: number | null
          selected_appliances?: Json | null
          session_token: string
          status?: string | null
          total_daily_wh?: number | null
          total_price_eur?: number | null
          updated_at?: string | null
          usage_type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          body_type_id?: string | null
          build_year?: number | null
          climate?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          motorisation_id?: string | null
          persons?: number | null
          recommended_battery_ah?: number | null
          recommended_dc_dc_a?: number | null
          recommended_inverter_w?: number | null
          recommended_products?: Json | null
          recommended_solar_wp?: number | null
          selected_appliances?: Json | null
          session_token?: string
          status?: string | null
          total_daily_wh?: number | null
          total_price_eur?: number | null
          updated_at?: string | null
          usage_type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configurator_sessions_body_type_id_fkey"
            columns: ["body_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_body_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configurator_sessions_motorisation_id_fkey"
            columns: ["motorisation_id"]
            isOneToOne: false
            referencedRelation: "vehicle_motorisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configurator_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_manuals: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          is_published: boolean
          language: string
          product_name: string
          product_sku: string
          sort_order: number
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          is_published?: boolean
          language: string
          product_name: string
          product_sku: string
          sort_order?: number
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          is_published?: boolean
          language?: string
          product_name?: string
          product_sku?: string
          sort_order?: number
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_notifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          product_sku: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          product_sku: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          product_sku?: string
        }
        Relationships: []
      }
      vehicle_battery_locations: {
        Row: {
          accessibility: string | null
          id: string
          is_for_selfbuild: boolean | null
          label: string
          label_de: string | null
          label_en: string | null
          label_fr: string | null
          location_id: string
          max_height_mm: number | null
          max_length_mm: number | null
          max_weight_kg: number | null
          max_width_mm: number | null
          mounting_notes: string | null
          mounting_notes_de: string | null
          mounting_notes_en: string | null
          mounting_notes_fr: string | null
          popularity: number | null
          selfbuild_notes: string | null
          selfbuild_notes_de: string | null
          selfbuild_notes_en: string | null
          selfbuild_notes_fr: string | null
          sort_order: number | null
          temperature_exposure: string | null
          vehicle_id: string
          ventilation: string | null
        }
        Insert: {
          accessibility?: string | null
          id?: string
          is_for_selfbuild?: boolean | null
          label: string
          label_de?: string | null
          label_en?: string | null
          label_fr?: string | null
          location_id: string
          max_height_mm?: number | null
          max_length_mm?: number | null
          max_weight_kg?: number | null
          max_width_mm?: number | null
          mounting_notes?: string | null
          mounting_notes_de?: string | null
          mounting_notes_en?: string | null
          mounting_notes_fr?: string | null
          popularity?: number | null
          selfbuild_notes?: string | null
          selfbuild_notes_de?: string | null
          selfbuild_notes_en?: string | null
          selfbuild_notes_fr?: string | null
          sort_order?: number | null
          temperature_exposure?: string | null
          vehicle_id: string
          ventilation?: string | null
        }
        Update: {
          accessibility?: string | null
          id?: string
          is_for_selfbuild?: boolean | null
          label?: string
          label_de?: string | null
          label_en?: string | null
          label_fr?: string | null
          location_id?: string
          max_height_mm?: number | null
          max_length_mm?: number | null
          max_weight_kg?: number | null
          max_width_mm?: number | null
          mounting_notes?: string | null
          mounting_notes_de?: string | null
          mounting_notes_en?: string | null
          mounting_notes_fr?: string | null
          popularity?: number | null
          selfbuild_notes?: string | null
          selfbuild_notes_de?: string | null
          selfbuild_notes_en?: string | null
          selfbuild_notes_fr?: string | null
          sort_order?: number | null
          temperature_exposure?: string | null
          vehicle_id?: string
          ventilation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_battery_locations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_body_types: {
        Row: {
          campervan_notes: string | null
          campervan_suitability: string | null
          cargo_length_mm: number | null
          cargo_volume_m3: number | null
          cargo_width_mm: number | null
          cargo_width_wheelarches_mm: number | null
          code: string
          gross_vehicle_weight_kg: number | null
          id: string
          internal_height_mm: number | null
          label: string
          max_payload_kg: number | null
          max_roof_load_kg: number | null
          roof_type: string | null
          solar_max_area_m2: number | null
          solar_max_length_mm: number | null
          solar_max_width_mm: number | null
          sort_order: number | null
          total_height_mm: number | null
          total_length_mm: number | null
          total_width_mm: number | null
          vehicle_id: string
          wheelbase_mm: number | null
        }
        Insert: {
          campervan_notes?: string | null
          campervan_suitability?: string | null
          cargo_length_mm?: number | null
          cargo_volume_m3?: number | null
          cargo_width_mm?: number | null
          cargo_width_wheelarches_mm?: number | null
          code: string
          gross_vehicle_weight_kg?: number | null
          id?: string
          internal_height_mm?: number | null
          label: string
          max_payload_kg?: number | null
          max_roof_load_kg?: number | null
          roof_type?: string | null
          solar_max_area_m2?: number | null
          solar_max_length_mm?: number | null
          solar_max_width_mm?: number | null
          sort_order?: number | null
          total_height_mm?: number | null
          total_length_mm?: number | null
          total_width_mm?: number | null
          vehicle_id: string
          wheelbase_mm?: number | null
        }
        Update: {
          campervan_notes?: string | null
          campervan_suitability?: string | null
          cargo_length_mm?: number | null
          cargo_volume_m3?: number | null
          cargo_width_mm?: number | null
          cargo_width_wheelarches_mm?: number | null
          code?: string
          gross_vehicle_weight_kg?: number | null
          id?: string
          internal_height_mm?: number | null
          label?: string
          max_payload_kg?: number | null
          max_roof_load_kg?: number | null
          roof_type?: string | null
          solar_max_area_m2?: number | null
          solar_max_length_mm?: number | null
          solar_max_width_mm?: number | null
          sort_order?: number | null
          total_height_mm?: number | null
          total_length_mm?: number | null
          total_width_mm?: number | null
          vehicle_id?: string
          wheelbase_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_body_types_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_cable_routes: {
        Row: {
          cable_protection: string | null
          cable_size_for_20a: number | null
          cable_size_for_30a: number | null
          cable_size_for_50a: number | null
          cable_size_for_80a: number | null
          description: string | null
          description_de: string | null
          description_en: string | null
          description_fr: string | null
          difficulty: string | null
          distance_meters: number | null
          hazards: string[] | null
          id: string
          label: string
          label_de: string | null
          label_en: string | null
          label_fr: string | null
          route_id: string
          sort_order: number | null
          tools_required: string[] | null
          vehicle_id: string
          voltage_drop_notes: string | null
        }
        Insert: {
          cable_protection?: string | null
          cable_size_for_20a?: number | null
          cable_size_for_30a?: number | null
          cable_size_for_50a?: number | null
          cable_size_for_80a?: number | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          hazards?: string[] | null
          id?: string
          label: string
          label_de?: string | null
          label_en?: string | null
          label_fr?: string | null
          route_id: string
          sort_order?: number | null
          tools_required?: string[] | null
          vehicle_id: string
          voltage_drop_notes?: string | null
        }
        Update: {
          cable_protection?: string | null
          cable_size_for_20a?: number | null
          cable_size_for_30a?: number | null
          cable_size_for_50a?: number | null
          cable_size_for_80a?: number | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          hazards?: string[] | null
          id?: string
          label?: string
          label_de?: string | null
          label_en?: string | null
          label_fr?: string | null
          route_id?: string
          sort_order?: number | null
          tools_required?: string[] | null
          vehicle_id?: string
          voltage_drop_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_cable_routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_grounding_points: {
        Row: {
          bolt_size: string | null
          existing_ground: boolean | null
          id: string
          location: string
          max_cable_size_mm2: number | null
          notes: string | null
          quality: string | null
          vehicle_id: string
        }
        Insert: {
          bolt_size?: string | null
          existing_ground?: boolean | null
          id?: string
          location: string
          max_cable_size_mm2?: number | null
          notes?: string | null
          quality?: string | null
          vehicle_id: string
        }
        Update: {
          bolt_size?: string | null
          existing_ground?: boolean | null
          id?: string
          location?: string
          max_cable_size_mm2?: number | null
          notes?: string | null
          quality?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_grounding_points_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_motorisations: {
        Row: {
          alternator_max_amps: number | null
          alternator_rated_amps: number | null
          alternator_type: string
          alternator_voltage_max: number | null
          alternator_voltage_min: number | null
          bms_shunt_location: string | null
          can_bus_type: string | null
          charging_at_idle_amps: number | null
          displacement_cc: number | null
          emission_standard: string | null
          engine_code: string
          engine_family: string
          fuel_consumption_l100km: number | null
          fuel_type: string | null
          has_bms_shunt: boolean | null
          has_brake_regen: boolean | null
          has_smart_alternator: boolean | null
          has_start_stop: boolean | null
          id: string
          idle_rpm: number | null
          notes: string | null
          power_hp: number | null
          power_kw: number | null
          production_year_end: number | null
          production_year_start: number | null
          smart_alternator_behavior: string | null
          smart_alternator_workaround: string | null
          sort_order: number | null
          starter_battery_ah: number | null
          starter_battery_location: string | null
          starter_battery_type: string | null
          torque_nm: number | null
          transmission: string | null
          transmission_options: string[] | null
          vehicle_id: string
        }
        Insert: {
          alternator_max_amps?: number | null
          alternator_rated_amps?: number | null
          alternator_type: string
          alternator_voltage_max?: number | null
          alternator_voltage_min?: number | null
          bms_shunt_location?: string | null
          can_bus_type?: string | null
          charging_at_idle_amps?: number | null
          displacement_cc?: number | null
          emission_standard?: string | null
          engine_code: string
          engine_family: string
          fuel_consumption_l100km?: number | null
          fuel_type?: string | null
          has_bms_shunt?: boolean | null
          has_brake_regen?: boolean | null
          has_smart_alternator?: boolean | null
          has_start_stop?: boolean | null
          id?: string
          idle_rpm?: number | null
          notes?: string | null
          power_hp?: number | null
          power_kw?: number | null
          production_year_end?: number | null
          production_year_start?: number | null
          smart_alternator_behavior?: string | null
          smart_alternator_workaround?: string | null
          sort_order?: number | null
          starter_battery_ah?: number | null
          starter_battery_location?: string | null
          starter_battery_type?: string | null
          torque_nm?: number | null
          transmission?: string | null
          transmission_options?: string[] | null
          vehicle_id: string
        }
        Update: {
          alternator_max_amps?: number | null
          alternator_rated_amps?: number | null
          alternator_type?: string
          alternator_voltage_max?: number | null
          alternator_voltage_min?: number | null
          bms_shunt_location?: string | null
          can_bus_type?: string | null
          charging_at_idle_amps?: number | null
          displacement_cc?: number | null
          emission_standard?: string | null
          engine_code?: string
          engine_family?: string
          fuel_consumption_l100km?: number | null
          fuel_type?: string | null
          has_bms_shunt?: boolean | null
          has_brake_regen?: boolean | null
          has_smart_alternator?: boolean | null
          has_start_stop?: boolean | null
          id?: string
          idle_rpm?: number | null
          notes?: string | null
          power_hp?: number | null
          power_kw?: number | null
          production_year_end?: number | null
          production_year_start?: number | null
          smart_alternator_behavior?: string | null
          smart_alternator_workaround?: string | null
          sort_order?: number | null
          starter_battery_ah?: number | null
          starter_battery_location?: string | null
          starter_battery_type?: string | null
          torque_nm?: number | null
          transmission?: string | null
          transmission_options?: string[] | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_motorisations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_popular_configs: {
        Row: {
          battery_capacity_ah: number | null
          battery_type: string | null
          budget_max_eur: number | null
          budget_min_eur: number | null
          config_name: string
          daily_consumption_wh: number | null
          dc_dc_charger_a: number | null
          estimated_days_autark: number | null
          id: string
          inverter_w: number | null
          recommended_products: string[] | null
          shore_power_charger_a: number | null
          solar_wp: number | null
          sort_order: number | null
          typical_body: string | null
          use_case: string | null
          vehicle_id: string
        }
        Insert: {
          battery_capacity_ah?: number | null
          battery_type?: string | null
          budget_max_eur?: number | null
          budget_min_eur?: number | null
          config_name: string
          daily_consumption_wh?: number | null
          dc_dc_charger_a?: number | null
          estimated_days_autark?: number | null
          id?: string
          inverter_w?: number | null
          recommended_products?: string[] | null
          shore_power_charger_a?: number | null
          solar_wp?: number | null
          sort_order?: number | null
          typical_body?: string | null
          use_case?: string | null
          vehicle_id: string
        }
        Update: {
          battery_capacity_ah?: number | null
          battery_type?: string | null
          budget_max_eur?: number | null
          budget_min_eur?: number | null
          config_name?: string
          daily_consumption_wh?: number | null
          dc_dc_charger_a?: number | null
          estimated_days_autark?: number | null
          id?: string
          inverter_w?: number | null
          recommended_products?: string[] | null
          shore_power_charger_a?: number | null
          solar_wp?: number | null
          sort_order?: number | null
          typical_body?: string | null
          use_case?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_popular_configs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_warnings: {
        Row: {
          affected_engines: string[] | null
          affected_years: number[] | null
          category: string
          description: string
          description_de: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          severity: string
          solution: string | null
          solution_de: string | null
          solution_en: string | null
          solution_fr: string | null
          sort_order: number | null
          source: string | null
          title: string
          title_de: string | null
          title_en: string | null
          title_fr: string | null
          vehicle_id: string
        }
        Insert: {
          affected_engines?: string[] | null
          affected_years?: number[] | null
          category: string
          description: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          severity: string
          solution?: string | null
          solution_de?: string | null
          solution_en?: string | null
          solution_fr?: string | null
          sort_order?: number | null
          source?: string | null
          title: string
          title_de?: string | null
          title_en?: string | null
          title_fr?: string | null
          vehicle_id: string
        }
        Update: {
          affected_engines?: string[] | null
          affected_years?: number[] | null
          category?: string
          description?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          severity?: string
          solution?: string | null
          solution_de?: string | null
          solution_en?: string | null
          solution_fr?: string | null
          sort_order?: number | null
          source?: string | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          title_fr?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_warnings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string | null
          generation: string
          generation_label: string
          id: string
          image_url: string | null
          is_active: boolean | null
          model: string
          platform_shared_with: string[] | null
          popularity_notes: string | null
          popularity_rank: number | null
          production_year_end: number | null
          production_year_start: number
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          generation: string
          generation_label: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model: string
          platform_shared_with?: string[] | null
          popularity_notes?: string | null
          popularity_rank?: number | null
          production_year_end?: number | null
          production_year_start: number
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          generation?: string
          generation_label?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model?: string
          platform_shared_with?: string[] | null
          popularity_notes?: string | null
          popularity_rank?: number | null
          production_year_end?: number | null
          production_year_start?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
