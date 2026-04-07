import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  old_price: number | null;
  new_price: number;
  is_best_seller: boolean;
  category_id: string | null;
  active: boolean;
  sort_order: number;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

const ProductList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name, icon, sort_order").eq("active", true).order("sort_order"),
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <main className="mt-2 pb-4">
        <div className="container">
          <div className="bg-secondary rounded-xl p-3 text-center text-sm mb-2 animate-pulse h-10" />
        </div>
      </main>
    );
  }

  if (categories.length === 0 && products.length === 0) {
    return (
      <main className="mt-2 pb-4">
        <div className="container">
          <div className="bg-secondary rounded-xl p-3 text-center text-sm mb-2">
            <b>Entrega Grátis</b> para <b>sua região</b>!
          </div>
          <div className="bg-accent rounded-xl p-3 text-center text-sm text-primary mb-4">
            Experimente nossos sushis frescos com preços especiais 🍣
          </div>
          <p className="text-center text-muted-foreground text-sm py-8">Produtos em breve...</p>
        </div>
      </main>
    );
  }

  const uncategorized = products.filter((p) => !p.category_id);
  const grouped = categories
    .map((cat) => ({
      ...cat,
      products: products.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <main className="mt-2 pb-4">
      <div className="container">
        <div className="bg-secondary rounded-xl p-3 text-center text-sm mb-2">
          <b>Entrega Grátis</b> para <b>sua região</b>!
        </div>
        <div className="bg-accent rounded-xl p-3 text-center text-sm text-primary mb-4">
          Experimente nossos sushis frescos com preços especiais 🍣
        </div>
      </div>

      {grouped.map((cat) => (
        <section key={cat.id} className="mb-6">
          <h2 className="text-lg font-bold text-primary px-4 mb-3">
            {cat.icon} {cat.name}
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
            {cat.products.map((product) => (
              <ProductScrollCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-primary px-4 mb-3">📦 Outros</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
            {uncategorized.map((product) => (
              <ProductScrollCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const ProductScrollCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) =>
    `R$ ${price.toFixed(2).replace(".", ",")}`;

  return (
    <a
      href="#"
      className={`flex-shrink-0 w-[160px] snap-start rounded-2xl overflow-hidden product-card ${
        product.is_best_seller ? "border-2 border-success animate-pulse-green" : ""
      }`}
    >
      <div className="w-full rounded-2xl overflow-hidden border border-border bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain" loading="lazy" />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-3xl">🍣</div>
        )}
      </div>
      <div className="p-2 flex flex-col">
        <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{product.name}</h3>
        <span className="text-[10px] text-success mt-0.5">Frete Grátis</span>
        {product.old_price && (
          <div className="text-[10px] mt-0.5">
            de <span className="text-price-old !text-[10px]">{formatPrice(product.old_price)}</span> por
          </div>
        )}
        <span className="text-success font-bold text-base">{formatPrice(product.new_price)}</span>
        {product.is_best_seller && (
          <span className="text-[9px] mt-0.5">
            🔥 <b className="bg-destructive text-destructive-foreground rounded px-1 py-0.5">{product.stock} un.</b> restantes
          </span>
        )}
      </div>
    </a>
  );
};

export default ProductList;
