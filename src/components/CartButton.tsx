import { ShoppingCart } from "lucide-react";

const CartButton = () => {
  return (
    <a
      href="#"
      className="fixed top-3 right-3 z-50 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg"
    >
      <ShoppingCart className="w-5 h-5 text-primary-foreground" />
    </a>
  );
};

export default CartButton;
