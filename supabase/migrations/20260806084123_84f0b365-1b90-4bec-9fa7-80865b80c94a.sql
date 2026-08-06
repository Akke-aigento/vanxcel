CREATE TABLE public.product_manuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku text NOT NULL,
  product_name text NOT NULL,
  language text NOT NULL CHECK (language IN ('nl','en','fr','de')),
  title text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_manuals TO anon;
GRANT SELECT ON public.product_manuals TO authenticated;
GRANT ALL ON public.product_manuals TO service_role;

ALTER TABLE public.product_manuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published manuals"
ON public.product_manuals FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_product_manuals_updated_at
BEFORE UPDATE ON public.product_manuals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_manuals_published ON public.product_manuals (is_published, product_name, sort_order);