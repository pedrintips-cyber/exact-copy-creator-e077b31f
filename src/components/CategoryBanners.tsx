import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CategoryBannerData {
  key: string;
  slug: string;
  fallbackLabel: string;
}

const CATEGORY_BANNERS: CategoryBannerData[] = [
  { key: "banner_promocoes", slug: "promocoes", fallbackLabel: "🔥 Promoções" },
  { key: "banner_pizzas", slug: "pizzas", fallbackLabel: "🍕 Pizzas" },
  { key: "banner_bebidas", slug: "bebidas", fallbackLabel: "🥤 Bebidas" },
];

const CategoryBanners = () => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", CATEGORY_BANNERS.map((b) => b.key));
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value || ""; });
      setImages(map);
    };
    load();
  }, []);

  return (
    <section className="px-4 py-4 space-y-3">
      {CATEGORY_BANNERS.map((banner, i) => {
        const imageUrl = images[banner.key];
        const isPromo = i === 0;

        return (
          <Link
            key={banner.key}
            to={`/categoria/${banner.slug}`}
            className={`block overflow-hidden rounded-2xl shadow-lg active:scale-[0.98] transition-transform ${
              isPromo ? "ring-2 ring-destructive/50" : ""
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={banner.fallbackLabel}
                className={`w-full object-cover ${isPromo ? "h-44" : "h-32"}`}
              />
            ) : (
              <div
                className={`w-full flex items-center justify-center ${
                  isPromo
                    ? "h-44 bg-gradient-to-r from-destructive to-destructive/70"
                    : i === 1
                    ? "h-32 bg-gradient-to-r from-primary to-primary/70"
                    : "h-32 bg-gradient-to-r from-accent to-accent/70"
                }`}
              >
                <span className={`font-black ${isPromo ? "text-2xl text-destructive-foreground" : "text-xl text-foreground"}`}>
                  {banner.fallbackLabel}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </section>
  );
};

export default CategoryBanners;
