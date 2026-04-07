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
        toast.error(`Máximo ${group.max_select} opção(ões) em ${group.name}.`);
        return current;
      }

      return { ...current, [group.id]: [...selected, itemId] };
    });
  };

  const validateSelections = () => {
    for (const group of groups) {
      const selected = selectedItems[group.id] || [];

      if (selected.length < group.min_select) {
        toast.error(`Escolha pelo menos ${group.min_select} em ${group.name}.`);
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

    toast.success("Adicionado ao carrinho!");
    navigate("/carrinho");
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4 text-muted-foreground text-sm">Carregando...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-sm font-semibold">Produto não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-3 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
          <Link to="/carrinho" className="text-xs font-medium text-primary">
            Ver carrinho
          </Link>
        </div>

        {/* Product Card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Image */}
          <div className="flex items-center justify-center bg-muted border-b border-border p-3 min-h-[160px]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="max-h-[180px] w-full object-contain" />
            ) : (
              <div className="text-5xl">🍕</div>
            )}
          </div>

          <div className="p-3 space-y-3">
            {/* Name & Price */}
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{product.name}</h1>
              {product.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{product.description}</p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                {product.old_price && (
                  <span className="text-xs line-through text-muted-foreground">
                    {formatPrice(Number(product.old_price))}
                  </span>
                )}
                <span className="text-lg font-bold text-success">
                  {formatPrice(Number(product.new_price) + extraPrice)}
                </span>
              </div>
            </div>

            {/* Option Groups */}
            {groups.map((group) => {
              const selected = selectedItems[group.id] || [];
              const groupItems = groupedItems[group.id] || [];

              return (
                <section key={group.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-2">
                    <h2 className="text-sm font-semibold text-foreground">{group.name}</h2>
                    <p className="text-[10px] text-muted-foreground">
                      {group.description ||
                        (group.selection_type === "single"
                          ? "Escolha 1 opção"
                          : `De ${group.min_select} até ${group.max_select} opções`)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {groupItems.map((item) => {
                      const active = selected.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleSelection(group, item.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                            active
                              ? "border-primary bg-accent text-accent-foreground"
                              : "border-border bg-card text-foreground"
                          }`}
                        >
                          <span className="text-xs font-medium">{item.name}</span>
                          <span className="text-[10px] font-semibold text-success whitespace-nowrap ml-2">
                            {item.price_adjustment > 0 ? `+ ${formatPrice(Number(item.price_adjustment))}` : "Incluso"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Quantity */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Quantidade</p>
                <p className="text-sm font-bold">{quantity}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button size="icon" className="h-7 w-7" onClick={() => setQuantity((v) => v + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-3 py-2.5 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-bold text-success truncate">{formatPrice(totalPrice)}</p>
          </div>
          <Button onClick={handleAddToCart} size="sm" className="gap-1.5 text-xs shrink-0">
            <ShoppingCart className="h-3.5 w-3.5" /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
