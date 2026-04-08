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

      <div className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Flame className="h-3.5 w-3.5" /> Oferta do dia
          </div>
          <h1 className="text-lg font-black text-foreground">Promoção do Dia</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Um único destaque bem apresentado, sem cabeçalho gigante e com foco total no produto.
          </p>
        </div>

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
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <div className="relative flex min-h-[220px] items-center justify-center border-b border-border bg-muted p-4">
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

              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{product.name}</h2>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{product.description}</p>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div className="min-w-0">
                    {product.old_price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(Number(product.old_price))}
                      </p>
                    )}
                    <p className="text-xl font-black text-success break-words">{formatPrice(Number(product.new_price))}</p>
                  </div>

                  <Button size="sm" className="gap-1.5 rounded-xl text-xs shrink-0">
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
