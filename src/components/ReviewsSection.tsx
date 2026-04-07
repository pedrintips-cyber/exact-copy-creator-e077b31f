import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  customer_name: string;
  text: string;
  rating: number;
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-warning text-warning" : "text-muted"}`} />
    ))}
  </div>
);

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, customer_name, text, rating")
        .eq("active", true)
        .order("created_at", { ascending: false });
      setReviews(data || []);
    };
    load();
  }, []);

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;

  return (
    <section className="container pb-20">
      <div className="bg-secondary rounded-xl p-4 text-center mb-4">
        <b className="text-xl">{avg.toFixed(1)}/5</b>
        <div className="flex justify-center mt-1">
          <Stars rating={Math.round(avg)} />
        </div>
        <p className="text-muted-foreground text-sm mt-1">{reviews.length} avaliações no total</p>
      </div>

      <div className="space-y-0">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start py-3 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-base text-foreground">{review.customer_name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-sm">{Number(review.rating).toFixed(1)}</span>
                <Stars rating={Math.round(Number(review.rating))} />
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
