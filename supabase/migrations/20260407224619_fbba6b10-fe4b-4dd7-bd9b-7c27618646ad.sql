CREATE TABLE public.product_option_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  selection_type TEXT NOT NULL DEFAULT 'single',
  min_select INTEGER NOT NULL DEFAULT 0,
  max_select INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT product_option_groups_selection_type_check CHECK (selection_type IN ('single', 'multiple'))
);

CREATE TABLE public.product_option_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_option_groups_product_id ON public.product_option_groups(product_id);
CREATE INDEX idx_product_option_groups_sort_order ON public.product_option_groups(sort_order);
CREATE INDEX idx_product_option_items_group_id ON public.product_option_items(option_group_id);
CREATE INDEX idx_product_option_items_sort_order ON public.product_option_items(sort_order);

ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product option groups"
ON public.product_option_groups
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active product option groups"
ON public.product_option_groups
FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Admins can manage product option items"
ON public.product_option_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active product option items"
ON public.product_option_items
FOR SELECT
TO public
USING (
  active = true
  AND EXISTS (
    SELECT 1
    FROM public.product_option_groups pog
    WHERE pog.id = product_option_items.option_group_id
      AND pog.active = true
  )
);

CREATE TRIGGER update_product_option_groups_updated_at
BEFORE UPDATE ON public.product_option_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_option_items_updated_at
BEFORE UPDATE ON public.product_option_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();