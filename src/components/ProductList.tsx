import { useState, useEffect, useRef } from "react";
import marmitexPequena from "@/assets/marmitex-pequena.jpg";
import marmitexGrande from "@/assets/marmitex-grande.jpg";
import kitFamilia from "@/assets/kit-familia.jpg";
import marmitexMilanesa from "@/assets/marmitex-milanesa.jpg";
import marmitexStrogonoff from "@/assets/marmitex-strogonoff.jpg";
import marmitexCostela from "@/assets/marmitex-costela.jpg";
import marmitexFeijoada from "@/assets/marmitex-feijoada.jpg";
import marmitexParmegiana from "@/assets/marmitex-parmegiana.jpg";

interface Product {
  name: string;
  image: string;
  oldPrice: string;
  newPrice: string;
  isBestSeller?: boolean;
}

interface Category {
  title: string;
  products: Product[];
}

const categories: Category[] = [
  {
    title: "🔥 Promoções do Dia",
    products: [
      { name: "Marmitex Pequena Com Churrasco", image: marmitexPequena, oldPrice: "R$ 39,90", newPrice: "R$ 23,90" },
      { name: "Marmitex Grande Com Churrasco", image: marmitexGrande, oldPrice: "R$ 43,80", newPrice: "R$ 28,90" },
      { name: "Kit Familia 3 Marmitex Grande", image: kitFamilia, oldPrice: "R$ 69,90", newPrice: "R$ 54,90", isBestSeller: true },
      { name: "Marmitex Bife Milanesa", image: marmitexMilanesa, oldPrice: "R$ 39,80", newPrice: "R$ 23,90" },
    ],
  },
  {
    title: "🥩 Churrasco & Costela",
    products: [
      { name: "Marmitex Grande Com Churrasco", image: marmitexGrande, oldPrice: "R$ 43,80", newPrice: "R$ 28,90" },
      { name: "Marmitex Costela Assada", image: marmitexCostela, oldPrice: "R$ 39,80", newPrice: "R$ 29,90", isBestSeller: true },
      { name: "Marmitex Pequena Churrasco", image: marmitexPequena, oldPrice: "R$ 39,90", newPrice: "R$ 23,90" },
    ],
  },
  {
    title: "🍛 Pratos Tradicionais",
    products: [
      { name: "Marmitex Strogonoff", image: marmitexStrogonoff, oldPrice: "R$ 39,80", newPrice: "R$ 25,90" },
      { name: "Marmitex Feijoada", image: marmitexFeijoada, oldPrice: "R$ 39,80", newPrice: "R$ 32,90" },
      { name: "Marmitex Bife Parmegiana", image: marmitexParmegiana, oldPrice: "R$ 39,80", newPrice: "R$ 29,90" },
      { name: "Marmitex Bife Milanesa", image: marmitexMilanesa, oldPrice: "R$ 39,80", newPrice: "R$ 23,90" },
    ],
  },
];

const ProductList = () => {
  const [stock, setStock] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock((prev) => (prev > 1 ? prev - 1 : 1));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="mt-2 pb-4">
      {/* Alerts */}
      <div className="container">
        <div className="bg-secondary rounded-xl p-3 text-center text-sm mb-2">
          <b>Entrega Grátis</b> para <b>sua região</b>!
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center text-sm text-primary mb-4">
          Aproveite nossa promoção com preços irresistíveis 💜
        </div>
      </div>

      {/* Category sections with horizontal scroll products */}
      {categories.map((cat, catIndex) => (
        <section key={catIndex} className="mb-6">
          <h2 className="text-lg font-bold text-primary px-4 mb-3">{cat.title}</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
            {cat.products.map((product, i) => (
              <ProductScrollCard key={i} product={product} stock={stock} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};

const ProductScrollCard = ({ product, stock }: { product: Product; stock: number }) => {
  return (
    <a
      href="#"
      className={`flex-shrink-0 w-[160px] snap-start rounded-2xl overflow-hidden product-card ${
        product.isBestSeller ? "border-2 border-success animate-pulse-green" : ""
      }`}
    >
      <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-2 flex flex-col">
        <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{product.name}</h3>
        <span className="text-[10px] text-success mt-0.5">Frete Grátis</span>
        <div className="text-[10px] mt-0.5">
          de <span className="text-price-old !text-[10px]">{product.oldPrice}</span> por
        </div>
        <span className="text-success font-bold text-base">{product.newPrice}</span>
        {product.isBestSeller && (
          <span className="text-[9px] mt-0.5">
            🔥 <b className="bg-destructive text-destructive-foreground rounded px-1 py-0.5">{stock} un.</b> restantes
          </span>
        )}
      </div>
    </a>
  );
};

export default ProductList;
