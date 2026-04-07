import { Star } from "lucide-react";

const reviews = [
  { name: "Carlos M", text: "Simplesmente perfeito! A comida é deliciosa, bem temperada e sempre quentinha. Melhor marmitaria que já experimentei." },
  { name: "Ana Paula S", text: "Entrega rápida e marmita super bem servida! Dá para ver que os ingredientes são frescos e de qualidade. Virei cliente fiel!" },
  { name: "Rodrigo L.", text: "Sabor de comida caseira que lembra a da minha mãe! Tudo muito bem feito, bem embalado e sempre no capricho" },
  { name: "Fernanda R", text: "Melhor custo-benefício! Porção generosa, comida deliciosa e preço justo. Recomendo para todo mundo!" },
  { name: "Marcos P", text: "Já pedi em várias marmitarias, mas essa aqui superou todas! Sabor incrível e um atendimento impecável." },
  { name: "Juliana C", text: "Perfeito para o dia a dia! Variedade no cardápio, tempero na medida certa e sempre entregam no horário." },
  { name: "Rafael T", text: "Bom, barato e entrega rápida. Não tem erro, semana que vem peço de novo" },
  { name: "Iana", text: "Pedi pela primeira vez e td mundo gostou, vamos pedir mais!" },
  { name: "Gustavo", text: "Sempre que posso, peço aqui! Qualidade incrível, e a comida chega sempre quentinha. Nota 10!" },
  { name: "Ana", text: "Aquele almoço perfeito que faz o dia ficar melhor! Tudo delicioso, bem servido e chega rapidinho." },
];

const Stars = () => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
    ))}
  </div>
);

const ReviewsSection = () => {
  return (
    <section className="container pb-20">
      {/* Rating summary */}
      <div className="bg-secondary rounded-xl p-4 text-center mb-4">
        <b className="text-xl">4.9/5</b>
        <div className="flex justify-center mt-1">
          <Stars />
        </div>
        <p className="text-muted-foreground text-sm mt-1">1360 avaliações no total</p>
      </div>

      {/* Individual reviews */}
      <div className="space-y-0">
        {reviews.map((review, i) => (
          <div key={i} className="flex items-start py-3 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-base text-foreground">{review.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-sm">5.0</span>
                <Stars />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
