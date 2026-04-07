
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert visits" ON public.site_visits;

-- Recreate with more specific checks
CREATE POLICY "Anyone can create orders" ON public.orders 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    customer_name IS NOT NULL AND 
    customer_phone IS NOT NULL AND 
    total > 0
  );

CREATE POLICY "Anyone can log visits" ON public.site_visits 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    page IS NOT NULL
  );
