import { useEffect, useState } from "react";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StoreHeader = () => {
  const [banners, setBanners] = useState<{ id: string; image_url: string; title: string | null }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, image_url, title")
        .eq("active", true)
        .order("sort_order");
      setBanners(data || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const bannerUrl = banners.length > 0 ? banners[currentBanner]?.image_url : null;

  return (
    <header className="bg-background border-b border-secondary">
      <div className="relative h-44 bg-primary">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={banners[currentBanner]?.title || "Banner"}
            className="w-full h-full object-cover"
            width={1200}
            height={512}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
        )}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-background w-4" : "bg-background/50"}`}
              />
            ))}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background rounded-t-[40px]" />
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-[120px] h-[120px] rounded-full border-4 border-background shadow-lg overflow-hidden bg-background flex items-center justify-center">
          <span className="text-4xl">🔥</span>
        </div>
      </div>

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
          <span className="text-muted-foreground">(avaliações)</span>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
