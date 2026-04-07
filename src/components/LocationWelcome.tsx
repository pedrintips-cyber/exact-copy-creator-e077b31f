import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";

interface LocationData {
  city: string;
  region: string;
}

const LocationWelcome = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("location_shown");
    if (alreadyShown) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setLocation({ city: data.city || "sua cidade", region: data.region || "sua região" });
      } catch {
        setLocation({ city: "sua cidade", region: "sua região" });
      }
      setVisible(true);
      sessionStorage.setItem("location_shown", "true");
    };

    const timer = setTimeout(fetchLocation, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 250);
  };

  if (!visible || !location) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[85%] max-w-[300px] bg-background rounded-2xl shadow-xl p-5 text-center transition-all duration-250 ${closing ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
      >
        <button onClick={handleClose} className="absolute top-2.5 right-2.5">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-4xl block mx-auto mb-2">🍣</span>
        <p className="text-sm text-muted-foreground">Restaurante mais próximo de você</p>
        <p className="font-bold text-base text-foreground mt-0.5">
          📍 {location.city}, {location.region}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 text-xs">
          <span className="bg-success/10 text-success font-semibold px-2.5 py-1 rounded-full">🍣 30% OFF</span>
          <span className="bg-success/10 text-success font-semibold px-2.5 py-1 rounded-full">🚚 Frete Grátis</span>
        </div>
        <button
          onClick={handleClose}
          className="mt-4 w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-full text-sm"
        >
          Ver cardápio
        </button>
      </div>
    </>
  );
};

export default LocationWelcome;
