
-- Add multilingual columns to vehicle_warnings
ALTER TABLE public.vehicle_warnings
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_de text,
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_de text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS solution_en text,
  ADD COLUMN IF NOT EXISTS solution_de text,
  ADD COLUMN IF NOT EXISTS solution_fr text;

-- Add multilingual columns to appliances
ALTER TABLE public.appliances
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_de text,
  ADD COLUMN IF NOT EXISTS name_fr text;

-- Add multilingual columns to vehicle_battery_locations
ALTER TABLE public.vehicle_battery_locations
  ADD COLUMN IF NOT EXISTS label_en text,
  ADD COLUMN IF NOT EXISTS label_de text,
  ADD COLUMN IF NOT EXISTS label_fr text,
  ADD COLUMN IF NOT EXISTS mounting_notes_en text,
  ADD COLUMN IF NOT EXISTS mounting_notes_de text,
  ADD COLUMN IF NOT EXISTS mounting_notes_fr text,
  ADD COLUMN IF NOT EXISTS selfbuild_notes_en text,
  ADD COLUMN IF NOT EXISTS selfbuild_notes_de text,
  ADD COLUMN IF NOT EXISTS selfbuild_notes_fr text;

-- Add multilingual columns to vehicle_cable_routes
ALTER TABLE public.vehicle_cable_routes
  ADD COLUMN IF NOT EXISTS label_en text,
  ADD COLUMN IF NOT EXISTS label_de text,
  ADD COLUMN IF NOT EXISTS label_fr text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_de text,
  ADD COLUMN IF NOT EXISTS description_fr text;

-- Backfill appliances name_en from existing name column (which is already English)
UPDATE public.appliances SET name_en = name WHERE name_en IS NULL;
