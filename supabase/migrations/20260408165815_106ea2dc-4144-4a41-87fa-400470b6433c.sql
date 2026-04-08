
CREATE OR REPLACE FUNCTION public.auto_create_product_options()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cat_slug TEXT;
  group_id UUID;
BEGIN
  -- Get category slug
  SELECT slug INTO cat_slug FROM categories WHERE id = NEW.category_id;

  IF cat_slug IN ('pizzas', 'promocoes') THEN
    -- Create "Sabor" group
    INSERT INTO product_option_groups (product_id, name, description, selection_type, min_select, max_select, sort_order, active)
    VALUES (NEW.id, 'Sabor da Pizza', 'Escolha 1 sabor', 'single', 1, 1, 0, true)
    RETURNING id INTO group_id;

    INSERT INTO product_option_items (option_group_id, name, price_adjustment, sort_order, active) VALUES
      (group_id, 'Calabresa', 0, 0, true),
      (group_id, 'Portuguesa', 0, 1, true),
      (group_id, '4 Queijos', 0, 2, true),
      (group_id, 'Cheddar', 0, 3, true),
      (group_id, 'Strogonoff', 0, 4, true),
      (group_id, 'Frango c/ Catupiry', 0, 5, true),
      (group_id, 'Marguerita', 0, 6, true),
      (group_id, 'Pepperoni', 0, 7, true);

    -- Create "Borda" group
    INSERT INTO product_option_groups (product_id, name, description, selection_type, min_select, max_select, sort_order, active)
    VALUES (NEW.id, 'Borda', 'Escolha a borda', 'single', 1, 1, 1, true)
    RETURNING id INTO group_id;

    INSERT INTO product_option_items (option_group_id, name, price_adjustment, sort_order, active) VALUES
      (group_id, 'Sem borda recheada', 0, 0, true),
      (group_id, 'Borda de Catupiry', 0, 1, true),
      (group_id, 'Borda de Cheddar', 0, 2, true);

  ELSIF cat_slug = 'bebidas' THEN
    -- Create "Refrigerante" group
    INSERT INTO product_option_groups (product_id, name, description, selection_type, min_select, max_select, sort_order, active)
    VALUES (NEW.id, 'Escolha o Refrigerante', 'Escolha 1 opção', 'single', 1, 1, 0, true)
    RETURNING id INTO group_id;

    INSERT INTO product_option_items (option_group_id, name, price_adjustment, sort_order, active) VALUES
      (group_id, 'Coca-Cola', 0, 0, true),
      (group_id, 'Pepsi', 0, 1, true),
      (group_id, 'Guaraná Antarctica', 0, 2, true),
      (group_id, 'Fanta Uva', 0, 3, true),
      (group_id, 'Fanta Laranja', 0, 4, true),
      (group_id, 'Sukita', 0, 5, true);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_product_options
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_product_options();
