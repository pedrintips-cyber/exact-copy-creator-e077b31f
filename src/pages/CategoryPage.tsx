import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import CartButton from "@/components/CartButton";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  old_price: number | null;
  new_price: number;
  is_best_seller: boolean;
  stock: number;
}

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const categoryMeta: Record<string, { title: string; emoji: string }> = {
  promocoes: { title: "Promoções", emoji: "🔥" },
  pizzas: { title: "Pizzas", emoji: "🍕" },
  bebidas: { title: "Bebidas", emoji: "🥤" },
};

const CategoryPage = () => {
  const isPromo = (slug || "") === "promocoes";
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = categoryMeta[slug || ""] || { title: slug, emoji: "📦" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: cats } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug || "")
        .limit(1);

      if (cats && cats.length > 0) {
        const { data } = await supabase
          .from("products")
          .select("id, name, image_url, old_price, new_price, is_best_seller, stock")
          .eq("active", true)
          .eq("category_id", cats[0].id)
          .order("sort_order");
        setProducts(data || []);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <CartButton />

      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">
          {meta.emoji} {meta.title}
        </h1>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">{meta.emoji}</span>
            <p className="text-muted-foreground text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const discount = product.old_price
                ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
                : 0;

              return (
                <Link
                  key={product.id}
                  to={`/produto/${product.id}`}
                  className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm active:scale-[0.97] transition-transform"
                >
                  <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center">
                    {discount > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                        -{discount}%
                      </span>
                    )}
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-4xl">{meta.emoji}</span>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{product.name}</h3>
                    {product.old_price && (
                      <span className="text-[10px] line-through text-muted-foreground">{formatPrice(product.old_price)}</span>
                    )}
                    <span className="block text-success font-bold text-sm">{formatPrice(product.new_price)}</span>
                    {product.is_best_seller && (
                      <span className="text-[9px]">
                        🔥 <b className="bg-destructive text-destructive-foreground rounded px-1 py-0.5">{product.stock} un.</b>
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CategoryPage;
