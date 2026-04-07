import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "@/components/StoreHeader";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  old_price: number | null;
  new_price: number;
  image_url: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Bebidas = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load categories that are drink-related (by slug containing 'bebida' or similar)
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    setCategories(cats || []);
    setProducts(prods || []);
  };

  // Filter to show only drink categories
  const drinkCategories = categories.filter((c) =>
    c.name.toLowerCase().includes("bebida") ||
    c.name.toLowerCase().includes("drink") ||
    c.name.toLowerCase().includes("refrigerante") ||
    c.name.toLowerCase().includes("suco") ||
    c.name.toLowerCase().includes("cerveja")
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary p-4 text-center">
        <h1 className="text-xl font-bold text-primary-foreground">🍺 Bebidas</h1>
        <p className="text-primary-foreground/80 text-sm">Escolha suas bebidas favoritas</p>
      </div>

      {drinkCategories.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma categoria de bebida configurada ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Crie uma categoria com "Bebida" no nome pelo painel admin.
          </p>
        </div>
      ) : (
        drinkCategories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          if (catProducts.length === 0) return null;
          return (
            <section key={cat.id} className="mt-4">
              <h2 className="text-lg font-bold text-primary px-4 mb-3">{cat.icon} {cat.name}</h2>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
                {catProducts.map((p) => (
                  <a key={p.id} href="#" className="flex-shrink-0 w-[160px] snap-start rounded-2xl overflow-hidden product-card">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">🍺</div>
                      )}
                    </div>
                    <div className="p-2 flex flex-col">
                      <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{p.name}</h3>
                      {p.old_price && (
                        <div className="text-[10px] mt-0.5">
                          de <span className="text-price-old !text-[10px]">R$ {Number(p.old_price).toFixed(2)}</span> por
                        </div>
                      )}
                      <span className="text-success font-bold text-base">R$ {Number(p.new_price).toFixed(2)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default Bebidas;
