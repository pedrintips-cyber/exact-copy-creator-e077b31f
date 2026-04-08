import { Link } from "react-router-dom";
import { Flame, Pizza, Wine } from "lucide-react";

const CategoryBanners = () => {
  return (
    <section className="px-4 py-4 space-y-3">
      {/* Promoção - Destaque maior */}
      <Link
        to="/categoria/promocoes"
        className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-destructive to-destructive/80 p-5 shadow-lg border border-destructive/30 group active:scale-[0.98] transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive-foreground/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-destructive-foreground/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive-foreground/20 flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7 text-destructive-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-destructive-foreground/70 mb-0.5">
              🔥 Ofertas imperdíveis
            </div>
            <h2 className="text-xl font-black text-destructive-foreground">Promoções</h2>
            <p className="text-xs text-destructive-foreground/80 mt-0.5">Pizzas com preços especiais</p>
          </div>
          <span className="text-destructive-foreground/60 text-2xl">→</span>
        </div>
      </Link>

      {/* Pizzas */}
      <Link
        to="/categoria/pizzas"
        className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 shadow-md border border-primary/30 group active:scale-[0.98] transition-transform"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-foreground/5 rounded-full -translate-y-6 translate-x-6" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <Pizza className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-primary-foreground">Pizzas</h2>
            <p className="text-xs text-primary-foreground/80">Nossas pizzas artesanais</p>
          </div>
          <span className="text-primary-foreground/60 text-xl">→</span>
        </div>
      </Link>

      {/* Bebidas */}
      <Link
        to="/categoria/bebidas"
        className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/80 p-4 shadow-md border border-accent/30 group active:scale-[0.98] transition-transform"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full -translate-y-6 translate-x-6" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
            <Wine className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground">Bebidas</h2>
            <p className="text-xs text-muted-foreground">Refrigerantes, sucos e mais</p>
          </div>
          <span className="text-muted-foreground text-xl">→</span>
        </div>
      </Link>
    </section>
  );
};

export default CategoryBanners;
