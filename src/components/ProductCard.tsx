interface ProductCardProps {
  name: string;
  image: string;
  oldPrice: string;
  newPrice: string;
  isBestSeller?: boolean;
  stock?: number;
}

const ProductCard = ({ name, image, oldPrice, newPrice, isBestSeller, stock }: ProductCardProps) => {
  if (isBestSeller) {
    return (
      <div className="w-full max-w-[600px] product-card">
        <a
          href="#"
          className="flex flex-col-reverse p-4 rounded-2xl border-2 border-success animate-pulse-green"
        >
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border">
            <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="flex flex-col mb-3">
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <span className="text-sm mt-1">Frete Grátis</span>
            <div className="text-sm mt-1">
              de <span className="text-price-old">{oldPrice}</span> por
            </div>
            <span className="text-xl mt-1">
              <b className="bg-success text-success-foreground rounded-lg px-1.5 py-0.5">{newPrice}</b>
            </span>
            {stock && (
              <span className="badge-stock mt-1">
                🔥 Apenas{" "}
                <b className="bg-destructive text-destructive-foreground rounded-lg px-1.5 py-0.5">
                  {stock} unidade(s)
                </b>{" "}
                com esse preço especial
              </span>
            )}
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className="w-[calc(50%-10px)] max-w-[250px] min-h-[300px] product-card">
      <a href="#" className="flex flex-col gap-2 rounded-2xl">
        <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border">
          <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-col px-1">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <span className="text-sm mt-1">Frete Grátis</span>
          <div className="text-sm mt-1">
            de <span className="text-price-old">{oldPrice}</span> por
          </div>
          <span className="text-price">{newPrice}</span>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;
