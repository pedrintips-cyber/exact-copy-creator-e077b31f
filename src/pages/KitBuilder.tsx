import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface KitCategory {
  id: string;
  name: string;
  icon: string;
}

interface KitItem {
  id: string;
  name: string;
  description: string | null;
  price_per_unit: number;
  unit: string;
  image_url: string | null;
  kit_category_id: string | null;
  min_quantity: number;
  max_quantity: number;
  step: number;
}

interface CartItem {
  item: KitItem;
  quantity: number;
}

const KitBuilder = () => {
  const [categories, setCategories] = useState<KitCategory[]>([]);
  const [items, setItems] = useState<KitItem[]>([]);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cats, its] = await Promise.all([
      supabase.from("kit_categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("kit_items").select("*").eq("active", true).order("sort_order"),
    ]);
    setCategories(cats.data || []);
    setItems(its.data || []);
  };

  const addItem = (item: KitItem) => {
    const newCart = new Map(cart);
    const existing = newCart.get(item.id);
    if (existing) {
      const newQty = Math.min(existing.quantity + Number(item.step), Number(item.max_quantity));
      newCart.set(item.id, { ...existing, quantity: newQty });
    } else {
      newCart.set(item.id, { item, quantity: Number(item.min_quantity) });
    }
    setCart(newCart);
  };

  const removeItem = (item: KitItem) => {
    const newCart = new Map(cart);
    const existing = newCart.get(item.id);
    if (existing) {
      const newQty = existing.quantity - Number(item.step);
      if (newQty <= 0) {
        newCart.delete(item.id);
      } else {
        newCart.set(item.id, { ...existing, quantity: newQty });
      }
    }
    setCart(newCart);
  };

  const getTotal = () => {
    let total = 0;
    cart.forEach(({ item, quantity }) => {
      total += Number(item.price_per_unit) * quantity;
    });
    return total;
  };

  const getItemQty = (id: string) => cart.get(id)?.quantity || 0;

  const handleFinalize = () => {
    if (cart.size === 0) {
      toast.error("Adicione pelo menos um item ao combo!");
      return;
    }
    const items = Array.from(cart.values()).map(({ item, quantity }) => ({
      name: item.name,
      quantity,
      unit: item.unit,
      price: Number(item.price_per_unit) * quantity,
    }));
    const msg = items.map((i) => `${i.quantity}${i.unit} ${i.name} - R$${i.price.toFixed(2)}`).join("\n");
    const total = getTotal();
    const text = encodeURIComponent(`🍣 *Meu Combo Sushi*\n\n${msg}\n\n*Total: R$ ${total.toFixed(2)}*`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-primary p-4 text-center">
          <h1 className="text-xl font-bold text-primary-foreground">🍣 Monte Seu Combo</h1>
          <p className="text-primary-foreground/80 text-sm">Escolha seus sushis e acompanhamentos</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Nenhuma categoria configurada ainda.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-primary p-4 text-center">
        <h1 className="text-xl font-bold text-primary-foreground">🍣 Monte Seu Combo</h1>
        <p className="text-primary-foreground/80 text-sm">Escolha seus sushis e acompanhamentos</p>
      </div>

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.kit_category_id === cat.id);
        if (catItems.length === 0) return null;
        return (
          <section key={cat.id} className="mt-4 px-4">
            <h2 className="text-lg font-bold text-primary mb-3">{cat.icon} {cat.name}</h2>
            <div className="space-y-2">
              {catItems.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      <p className="text-success font-bold text-sm">
                        R$ {Number(item.price_per_unit).toFixed(2)}/{item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => removeItem(item)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold min-w-[40px] text-center">{qty}{item.unit}</span>
                        </>
                      )}
                      <Button size="icon" className="h-8 w-8" onClick={() => addItem(item)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {cart.size > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t p-4 shadow-lg">
          <div className="container flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{cart.size} itens no combo</p>
              <p className="text-xl font-bold text-success">R$ {getTotal().toFixed(2)}</p>
            </div>
            <Button onClick={handleFinalize} className="gap-2">
              <ShoppingCart className="w-4 h-4" /> Finalizar Combo
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default KitBuilder;
