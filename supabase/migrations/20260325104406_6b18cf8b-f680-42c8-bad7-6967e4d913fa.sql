CREATE TABLE public.product_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  product_sku text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);
ALTER TABLE public.product_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.product_notifications FOR INSERT WITH CHECK (true);