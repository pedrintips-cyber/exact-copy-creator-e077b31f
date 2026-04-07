import { useState, useEffect } from "react";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 58, seconds: 0 });

  useEffect(() => {
    let expiry = localStorage.getItem("expiryTime");
    if (!expiry) {
      const newExpiry = new Date(Date.now() + 58 * 60 * 1000).getTime();
      localStorage.setItem("expiryTime", String(newExpiry));
      expiry = String(newExpiry);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = parseInt(expiry!, 10) - now;
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary py-2 px-4 flex flex-col items-center">
      <b className="text-primary-foreground text-xs mb-1">🍕 Promoção especial acaba em:</b>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center">
          <span className="bg-primary-foreground/20 text-primary-foreground font-semibold text-base px-3 py-1 rounded-md min-w-[50px] text-center">
            {String(Math.floor(timeLeft.minutes / 60) + Math.floor(timeLeft.minutes)).padStart(2, "0")}
          </span>
          <p className="text-primary-foreground text-xs mt-0.5">Horas</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="bg-primary-foreground/20 text-primary-foreground font-semibold text-base px-3 py-1 rounded-md min-w-[50px] text-center">
            {String(timeLeft.minutes % 60).padStart(2, "0")}
          </span>
          <p className="text-primary-foreground text-xs mt-0.5">Minutos</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="bg-primary-foreground/20 text-primary-foreground font-semibold text-base px-3 py-1 rounded-md min-w-[50px] text-center">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <p className="text-primary-foreground text-xs mt-0.5">Segundos</p>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
