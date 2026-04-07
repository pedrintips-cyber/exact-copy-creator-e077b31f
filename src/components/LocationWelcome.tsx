import { useState, useEffect } from "react";
import { MapPin, X, Truck, Percent } from "lucide-react";

interface LocationData {
  city: string;
  region: string;
  country: string;
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
        setLocation({
          city: data.city || "sua cidade",
          region: data.region || "seu estado",
          country: data.country_name || "Brasil",
        });
        setVisible(true);
        sessionStorage.setItem("location_shown", "true");
      } catch {
        setLocation({
          city: "sua cidade",
          region: "sua região",
          country: "Brasil",
        });
        setVisible(true);
        sessionStorage.setItem("location_shown", "true");
      }
    };

    const timer = setTimeout(fetchLocation, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible || !location) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300 ${closing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-[360px] bg-background rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${closing ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
      >
        {/* Header with gradient */}
        <div className="bg-primary p-5 pb-8 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>
          <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-primary-foreground font-bold text-lg">Bem-vindo! 👋</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Identificamos sua localização
          </p>
        </div>

        {/* Content */}
        <div className="p-5 -mt-4 bg-background rounded-t-3xl relative">
          {/* Location badge */}
          <div className="bg-secondary rounded-2xl p-4 text-center mb-4">
            <p className="text-sm text-muted-foreground">Você foi direcionado para a loja de</p>
            <p className="text-lg font-bold text-foreground mt-1">
              📍 {location.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {location.region}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">50% de desconto</p>
                <p className="text-xs text-muted-foreground">Em todo o cardápio hoje!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Frete Grátis</p>
                <p className="text-xs text-muted-foreground">
                  Para toda a região de {location.city}, {location.region}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Aproveitar ofertas 🔥
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationWelcome;
