import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const CartButton = () => {
  const { itemsCount } = useCart();

  return (
    <Link
      to="/carrinho"
      aria-label="Abrir carrinho"
      className="fixed top-3 right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <ShoppingCart className="w-5 h-5 text-primary-foreground" />
      {itemsCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-success px-1.5 py-0.5 text-[10px] font-bold text-success-foreground">
          {itemsCount}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
