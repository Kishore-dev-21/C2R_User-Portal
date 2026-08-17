import { CheckCircle, Package, Truck, Fingerprint } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatusTimelineProps {
  currentStep: number;
}

const StatusTimeline = ({ currentStep }: StatusTimelineProps) => {
  const { t } = useLanguage();

  const steps = [
    { icon: CheckCircle, label: t("tracking.orderConfirmed"), short: "Confirmed" },
    { icon: Package,     label: t("tracking.itemsPrepared"),  short: "Packed"    },
    { icon: Truck,       label: t("tracking.outForDelivery"), short: "On Way"    },
    { icon: Fingerprint, label: t("tracking.delivered"),      short: "Delivered" },
  ];

  // progress fraction 0-1 across the bar
  const progressPct = Math.min((currentStep / (steps.length - 1)) * 100, 100);

  return (
    <div className="w-full select-none">
      {/* Pill track */}
      <div className="relative flex items-center justify-between mb-3">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/20 rounded-full" />

        {/* Animated fill */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-all duration-700 ease-in-out"
          style={{
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
            boxShadow: "0 0 8px rgba(255,255,255,0.5)",
          }}
        />

        {/* Step nodes */}
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i < currentStep;
          const isActive    = i === currentStep;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
              {/* Node circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-500 border-2
                  ${isCompleted
                    ? "bg-white border-white shadow-lg shadow-white/30"
                    : isActive
                    ? "bg-white/30 border-white animate-pulse shadow-lg shadow-white/20"
                    : "bg-white/10 border-white/30"
                  }
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isCompleted ? "text-primary" :
                    isActive    ? "text-white"   : "text-white/40"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`
                  text-[9px] font-semibold text-center leading-tight whitespace-nowrap
                  transition-all duration-300
                  ${isCompleted ? "text-white" :
                    isActive    ? "text-white font-bold" : "text-white/40"}
                `}
              >
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
