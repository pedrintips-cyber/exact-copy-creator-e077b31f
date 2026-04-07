import { Star, MapPin, ShoppingCart, CheckCircle } from "lucide-react";
import bannerImg from "@/assets/banner.jpg";
import logoImg from "@/assets/logo.png";

const StoreHeader = () => {
  return (
    <header className="bg-background border-b border-secondary">
      {/* Banner */}
      <div className="relative h-44 bg-primary">
        <img
          src={bannerImg}
          alt="Banner Sítio do Churrasco"
          className="w-full h-full object-cover"
          width={1200}
          height={512}
        />
        {/* Rounded white overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background rounded-t-[40px]" />
        {/* Logo */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-[120px] h-[120px] rounded-full border-4 border-background shadow-lg overflow-hidden bg-background flex items-center justify-center">
          <img src={logoImg} alt="Logo Sítio do Churrasco" className="w-full h-full object-cover" width={120} height={120} />
        </div>
      </div>

      {/* Store Info */}
      <div className="container flex flex-col items-center text-center pt-1 pb-2">
        <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-1">
          Sítio do Churrasco
          <CheckCircle className="w-4 h-4 text-primary fill-primary stroke-primary-foreground" />
        </h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <MapPin className="w-3 h-3" />
          <span>1,6km de você</span>
          <span>•</span>
          <span className="text-success">Entrega grátis</span>
        </div>

        <div className="flex items-center gap-1 text-sm mt-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <b>4.9/5</b>
          <span className="text-muted-foreground">(1360 avaliações)</span>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
