import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  new_price: number;
  old_price: number | null;
  stock: number | null;
}

interface ProductOptionGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: "single" | "multiple";
  min_select: number;
  max_select: number;
  sort_order: number;
}

interface ProductOptionItem {
  id: string;
  option_group_id: string;
  name: string;
  price_adjustment: number;
  sort_order: number;
}

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [groups, setGroups] = useState<ProductOptionGroup[]>([]);
  const [items, setItems] = useState<ProductOptionItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      const db = supabase as any;
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, description, image_url, new_price, old_price, stock")
        .eq("id", id)
        .eq("active", true)
        .maybeSingle();

      const { data: groupData } = await db
        .from("product_option_groups")
        .select("id, name, description, selection_type, min_select, max_select, sort_order")
        .eq("product_id", id)
        .eq("active", true)
        .order("sort_order");

      const groupIds = (groupData || []).map((group: ProductOptionGroup) => group.id);

      let optionItems: ProductOptionItem[] = [];
      if (groupIds.length > 0) {
        const { data: itemData } = await db
          .from("product_option_items")
          .select("id, option_group_id, name, price_adjustment, sort_order")
          .in("option_group_id", groupIds)
          .eq("active", true)
          .order("sort_order");

        optionItems = itemData || [];
      }

      setProduct(productData || null);
      setGroups(groupData || []);
      setItems(optionItems);
      setLoading(false);
    };

    void loadProduct();
  }, [id]);

  const groupedItems = useMemo(
    () =>
      items.reduce<Record<string, ProductOptionItem[]>>((acc, item) => {
        acc[item.option_group_id] = [...(acc[item.option_group_id] || []), item];
        return acc;
      }, {}),
    [items],
  );

  const selectedOptionObjects = useMemo(
    () =>
      groups
        .map((group) => ({
          groupId: group.id,
          groupName: group.name,
          items: (selectedItems[group.id] || [])
            .map((itemId) => items.find((item) => item.id === itemId))
            .filter(Boolean)
            .map((item) => ({
              id: item!.id,
              name: item!.name,
              priceAdjustment: Number(item!.price_adjustment || 0),
            })),
        }))
        .filter((group) => group.items.length > 0),
    [groups, items, selectedItems],
  );

  const extraPrice = selectedOptionObjects.reduce(
    (total, group) => total + group.items.reduce((sum, item) => sum + item.priceAdjustment, 0),
    0,
  );

  const totalPrice = product ? (Number(product.new_price) + extraPrice) * quantity : 0;

  const toggleSelection = (group: ProductOptionGroup, itemId: string) => {
    setSelectedItems((current) => {
      const selected = current[group.id] || [];

      if (group.selection_type === "single") {
        return { ...current, [group.id]: [itemId] };
      }

      if (selected.includes(itemId)) {
        return { ...current, [group.id]: selected.filter((id) => id !== itemId) };
      }

      if (selected.length >= group.max_select) {
        toast.error(`Você pode escolher até ${group.max_select} opção(ões) em ${group.name}.`);
        return current;
      }

      return { ...current, [group.id]: [...selected, itemId] };
    });
  };

  const validateSelections = () => {
    for (const group of groups) {
      const selected = selectedItems[group.id] || [];

      if (selected.length < group.min_select) {
        toast.error(`Escolha pelo menos ${group.min_select} opção(ões) em ${group.name}.`);
        return false;
      }

      if (selected.length > group.max_select) {
        toast.error(`Escolha no máximo ${group.max_select} opção(ões) em ${group.name}.`);
        return false;
      }
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!validateSelections()) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.image_url,
      basePrice: Number(product.new_price),
      quantity,
      selections: selectedOptionObjects,
    });

    toast.success("Pizza adicionada ao carrinho");
    navigate("/carrinho");
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4 text-muted-foreground">Carregando produto...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
        </Link>
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-lg font-semibold">Produto não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="container max-w-3xl px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
          </Link>
          <Link to="/carrinho" className="text-sm font-medium text-primary">
            Ver carrinho
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex min-h-[220px] items-center justify-center border-b border-border bg-muted p-4">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="max-h-[300px] w-full object-contain" />
            ) : (
              <div className="text-6xl">🍕</div>
            )}
          </div>

          <div className="space-y-5 p-5">
            <div>
              <h1 className="text-2xl font-black text-foreground">{product.name}</h1>
              {product.description && <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>}
              <div className="mt-3 flex items-end gap-2">
                {product.old_price && <span className="text-sm text-price-old">{formatPrice(Number(product.old_price))}</span>}
                <span className="text-2xl font-black text-success">{formatPrice(Number(product.new_price) + extraPrice)}</span>
              </div>
            </div>

            {groups.map((group) => {
              const selected = selectedItems[group.id] || [];
              const groupItems = groupedItems[group.id] || [];

              return (
                <section key={group.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-foreground">{group.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {group.description ||
                        (group.selection_type === "single"
                          ? "Escolha 1 opção"
                          : `Escolha de ${group.min_select} até ${group.max_select} opções`)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {groupItems.map((item) => {
                      const active = selected.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleSelection(group, item.id)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                            active
                              ? "border-primary bg-accent text-accent-foreground"
                              : "border-border bg-card text-foreground"
                          }`}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm font-semibold text-success">
                            {item.price_adjustment > 0 ? `+ ${formatPrice(Number(item.price_adjustment))}` : "Incluso"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade</p>
                <p className="text-lg font-bold">{quantity} pizza(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={() => setQuantity((value) => value + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="container flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total do item</p>
            <p className="text-2xl font-black text-success">{formatPrice(totalPrice)}</p>
          </div>
          <Button onClick={handleAddToCart} className="gap-2">
            <ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;