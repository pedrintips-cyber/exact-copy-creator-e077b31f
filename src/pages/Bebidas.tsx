import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import CartButton from "@/components/CartButton";
import { Link } from "react-router-dom";
import { Flame, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string | null;
  old_price: number | null;
  new_price: number;
  image_url: string | null;
}

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const Promocoes = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, old_price, new_price, image_url")
        .eq("active", true)
        .not("old_price", "is", null)
        .order("sort_order")
        .limit(1);

      const promo = (data || []).find((p: any) => p.old_price && p.old_price > p.new_price);
      setProduct(promo || null);
      setLoading(false);
    };
    load();
  }, []);

  const discount = product?.old_price
    ? Math.round(((Number(product.old_price) - Number(product.new_price)) / Number(product.old_price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <CartButton />

      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-4 py-6 text-center">
        <Flame className="h-8 w-8 text-primary-foreground mx-auto mb-1" />
        <h1 className="text-xl font-bold text-primary-foreground">Promoção do Dia</h1>
        <p className="text-primary-foreground/80 text-xs mt-1">Oferta especial por tempo limitado!</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : !product ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🍕</span>
            <p className="text-muted-foreground text-sm">Nenhuma promoção ativa no momento.</p>
            <p className="text-xs text-muted-foreground mt-1">Fique de olho! Novas promoções em breve.</p>
          </div>
        ) : (
          <Link to={`/produto/${product.id}`} className="block">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
              {/* Product image - large */}
              <div className="relative bg-muted flex items-center justify-center min-h-[220px] p-4">
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </div>
                )}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="max-h-[220px] w-full object-contain" />
                ) : (
                  <div className="text-7xl">🍕</div>
                )}
              </div>

              {/* Product info */}
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{product.description}</p>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {product.old_price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(Number(product.old_price))}
                      </p>
                    )}
                    <p className="text-2xl font-black text-success">{formatPrice(Number(product.new_price))}</p>
                  </div>

                  <Button size="sm" className="gap-1.5 text-xs">
                    <ShoppingCart className="h-3.5 w-3.5" /> Ver produto
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Promocoes;
