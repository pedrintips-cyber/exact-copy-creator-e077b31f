import StoreHeader from "@/components/StoreHeader";
import StatusBadge from "@/components/StatusBadge";
import CartButton from "@/components/CartButton";
import CountdownTimer from "@/components/CountdownTimer";
import ProductList from "@/components/ProductList";
import ReviewsSection from "@/components/ReviewsSection";
import LocationWelcome from "@/components/LocationWelcome";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LocationWelcome />
      <StatusBadge />
      <CartButton />
      <StoreHeader />
      <CountdownTimer />
      <ProductList />
      <ReviewsSection />
    </div>
  );
};

export default Index;
