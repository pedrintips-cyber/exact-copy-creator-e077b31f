import StoreHeader from "@/components/StoreHeader";
import StatusBadge from "@/components/StatusBadge";
import CartButton from "@/components/CartButton";
import CountdownTimer from "@/components/CountdownTimer";
import ProductList from "@/components/ProductList";
import ReviewsSection from "@/components/ReviewsSection";
import LocationWelcome from "@/components/LocationWelcome";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-14">
      <LocationWelcome />
      <StatusBadge />
      <CartButton />
      <StoreHeader />
      <CountdownTimer />
      <ProductList />
      <ReviewsSection />
      <BottomNav />
    </div>
  );
};

export default Index;
