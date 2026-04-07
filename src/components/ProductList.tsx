import ProductCard from "./ProductCard";
import marmitexPequena from "@/assets/marmitex-pequena.jpg";
import marmitexGrande from "@/assets/marmitex-grande.jpg";
import kitFamilia from "@/assets/kit-familia.jpg";
import marmitexMilanesa from "@/assets/marmitex-milanesa.jpg";
import marmitexStrogonoff from "@/assets/marmitex-strogonoff.jpg";
import marmitexCostela from "@/assets/marmitex-costela.jpg";
import marmitexFeijoada from "@/assets/marmitex-feijoada.jpg";
import marmitexParmegiana from "@/assets/marmitex-parmegiana.jpg";
import { useState, useEffect } from "react";

const ProductList = () => {
  const [stock, setStock] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock((prev) => (prev > 1 ? prev - 1 : 1));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container mt-2 pb-4">
      {/* Alerts */}
      <div className="bg-secondary rounded-xl p-3 text-center text-sm mb-2">
        <b>Entrega Grátis</b> para <b>sua região</b>!
      </div>
      <div className="bg-secondary rounded-xl p-3 text-center text-sm text-primary mb-5">
        Aproveite nossa promoção com preços irresistíveis igual Churrasco 💜
      </div>

      {/* Category title */}
      <h2 className="text-xl font-semibold text-primary mb-2">Ofertas para você!</h2>

      {/* Product grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        <ProductCard
          name="Marmitex Pequena Com Churrasco"
          image={marmitexPequena}
          oldPrice="R$ 39,90"
          newPrice="R$ 23,90"
        />
        <ProductCard
          name="Marmitex Grande Com Churrasco"
          image={marmitexGrande}
          oldPrice="R$ 43,80"
          newPrice="R$ 28,90"
        />
        <ProductCard
          name="Kit Familia 3 Marmitex Grande Com Churrasco"
          image={kitFamilia}
          oldPrice="R$ 69,90"
          newPrice="R$ 54,90"
          isBestSeller
          stock={stock}
        />
        <ProductCard
          name="Marmitex Grande Com Bife Milanesa"
          image={marmitexMilanesa}
          oldPrice="R$ 39,80"
          newPrice="R$ 23,90"
        />
        <ProductCard
          name="Marmitex Grande Com Strogonoff"
          image={marmitexStrogonoff}
          oldPrice="R$ 39,80"
          newPrice="R$ 25,90"
        />
        <ProductCard
          name="Marmitex Grande de Costela Assada"
          image={marmitexCostela}
          oldPrice="R$ 39,80"
          newPrice="R$ 29,90"
          isBestSeller
          stock={stock}
        />
        <ProductCard
          name="Marmitex Grande de Feijoada"
          image={marmitexFeijoada}
          oldPrice="R$ 39,80"
          newPrice="R$ 32,90"
        />
        <ProductCard
          name="Marmitex Grande Bife Parmegiana"
          image={marmitexParmegiana}
          oldPrice="R$ 39,80"
          newPrice="R$ 29,90"
        />
      </div>
    </main>
  );
};

export default ProductList;
