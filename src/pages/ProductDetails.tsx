import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from "lucide-react";
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
  const [selectionError, setSelectionError] = useState<string | null>(null);

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
        setSelectionError(null);
        return { ...current, [group.id]: [itemId] };
      }

      if (selected.includes(itemId)) {
        setSelectionError(null);
        return { ...current, [group.id]: selected.filter((id) => id !== itemId) };
      }

      if (selected.length >= group.max_select) {
        setSelectionError(`Máximo de ${group.max_select} opção(ões) em ${group.name}.`);
        return current;
      }

      setSelectionError(null);
      return { ...current, [group.id]: [...selected, itemId] };
    });
  };

  const validateSelections = () => {
    for (const group of groups) {
      const selected = selectedItems[group.id] || [];
      if (selected.length < group.min_select) {
        setSelectionError(`Escolha pelo menos ${group.min_select} opção(ões) em ${group.name}.`);
        return false;
      }
    }
    setSelectionError(null);
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

    navigate("/carrinho");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-2/3 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">😕</span>
        <p className="text-lg font-semibold text-foreground mb-1">Produto não encontrado</p>
        <p className="text-sm text-muted-foreground mb-4">Esse produto não existe ou foi removido.</p>
        <Link to="/" className="text-sm font-medium text-primary underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round(((Number(product.old_price) - Number(product.new_price)) / Number(product.old_price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero image */}
      <div className="relative">
        <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">🍕</span>
          )}
        </div>

        {/* Back button overlay */}
        <Link
          to="/"
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discount}%
          </div>
        )}

        {/* Curved overlay */}
        <div className="absolute -bottom-4 left-0 right-0 h-6 bg-background rounded-t-[24px]" />
      </div>

      {/* Product info */}
      <div className="px-4 -mt-1 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{product.name}</h1>
          {product.description && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          <div className="mt-3 flex items-baseline gap-2.5">
            {product.old_price && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(Number(product.old_price))}
              </span>
            )}
            <span className="text-2xl font-bold text-success">
              {formatPrice(Number(product.new_price) + extraPrice)}
            </span>
          </div>
        </div>

        {/* Option groups */}
        {groups.map((group) => {
          const selected = selectedItems[group.id] || [];
          const groupItems = groupedItems[group.id] || [];

          return (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h2 className="text-sm font-bold text-foreground">{group.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {group.description ||
                      (group.selection_type === "single"
                        ? "Escolha 1 opção"
                        : `De ${group.min_select} até ${group.max_select} opções`)}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Obrigatório
                </span>
              </div>

              <div className="space-y-2">
                {groupItems.map((item) => {
                  const active = selected.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelection(group, item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      {/* Radio / Check indicator */}
                      <div
                        className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                          active
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40 bg-transparent"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>

                      <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>

                      <span className={`shrink-0 text-xs font-semibold ${item.price_adjustment > 0 ? "text-success" : "text-muted-foreground"}`}>
                        {item.price_adjustment > 0 ? `+ ${formatPrice(Number(item.price_adjustment))}` : "Incluso"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quantity */}
        <div className="flex items-center justify-between bg-card rounded-2xl border border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Quantidade</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity((v) => Math.max(1, v - 1))}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-lg font-bold text-foreground w-6 text-center">{quantity}</span>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity((v) => v + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {selectionError && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive font-medium">
            ⚠️ {selectionError}
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-area-pb">
        <Button
          onClick={handleAddToCart}
          className="w-full h-12 rounded-2xl text-base font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <ShoppingCart className="h-5 w-5" />
          Adicionar · {formatPrice(totalPrice)}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
