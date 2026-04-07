import { Link, useLocation } from "react-router-dom";
import { Pizza, Flame, ChefHat } from "lucide-react";

const BottomNav = () => {
  const { pathname } = useLocation();

  const items = [
    { to: "/", label: "Cardápio", icon: Pizza },
    { to: "/promocoes", label: "Promoções", icon: Flame },
    { to: "/kit", label: "Monte o Seu", icon: ChefHat },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
