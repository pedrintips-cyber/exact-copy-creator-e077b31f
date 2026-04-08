import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CategoryBanner {
  id: string;
  name: string;
  slug: string;
  icon: string;
  banner_image_url: string | null;
}

const categoryOrder = ["promocoes", "pizzas", "bebidas"];

const CategoryBanners = () => {
  const [categories, setCategories] = useState<CategoryBanner[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, icon, banner_image_url")
        .eq("active", true)
        .in("slug", categoryOrder);

      const sorted = ((data as CategoryBanner[]) || []).sort(
        (a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug)
      );

      setCategories(sorted);
    };

    load();
  }, []);

  return (
    <section className="px-4 py-4 space-y-3">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          to={`/categoria/${category.slug}`}
          className={`block overflow-hidden rounded-2xl shadow-lg active:scale-[0.98] transition-transform ${index === 0 ? "ring-2 ring-destructive/50" : ""}`}
        >
          {category.banner_image_url ? (
            <img
              src={category.banner_image_url}
              alt={category.name}
              className={`w-full object-cover ${index === 0 ? "h-44" : "h-32"}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          ) : (
            <div className={`w-full flex items-center justify-center bg-muted ${index === 0 ? "h-44" : "h-32"}`}>
              <span className="text-5xl">{category.icon}</span>
            </div>
          )}
        </Link>
      ))}
    </section>
  );
};

export default CategoryBanners;
