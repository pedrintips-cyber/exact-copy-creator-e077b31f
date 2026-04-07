import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Link } from "react-router-dom";

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

const Promocoes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from("categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("products").select("*").eq("active", true).order("sort_order"),
    ]);
    setCategories(cats || []);
    setProducts((prods || []).filter((p: any) => p.old_price && p.old_price > p.new_price));
  };

  const grouped = categories
    .map((cat) => ({ ...cat, products: products.filter((p) => p.category_id === cat.id) }))
    .filter((g) => g.products.length > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary p-4 text-center">
        <h1 className="text-xl font-bold text-primary-foreground">🔥 Promoções</h1>
        <p className="text-primary-foreground/80 text-sm">Pizzas artesanais com descontos imperdíveis</p>
      </div>

      {grouped.length === 0 ? (
        <div className="p-8 text-center">
          <span className="text-4xl block mb-3">🍕</span>
          <p className="text-muted-foreground">Nenhuma promoção ativa no momento.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Fique de olho! Novas promoções em breve.
          </p>
        </div>
      ) : (
        grouped.map((cat) => (
          <section key={cat.id} className="mt-4">
            <h2 className="text-lg font-bold text-primary px-4 mb-3">{cat.icon} {cat.name}</h2>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
              {cat.products.map((p) => (
                <Link to={`/produto/${p.id}`} key={p.id} className="flex-shrink-0 w-[160px] snap-start rounded-2xl overflow-hidden product-card">
                  <div className="w-full rounded-2xl overflow-hidden border border-border bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-auto object-contain" loading="lazy" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-2xl">🍕</div>
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
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <BottomNav />
    </div>
  );
};

export default Promocoes;
