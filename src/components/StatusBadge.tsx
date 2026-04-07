import { Circle } from "lucide-react";

const StatusBadge = () => {
  return (
    <div className="fixed top-3 left-3 z-50 badge-open flex items-center gap-1.5 shadow-md">
      <Circle className="w-2.5 h-2.5 fill-success text-success animate-blink" />
      <span>ABERTO</span>
    </div>
  );
};

export default StatusBadge;
