import { Phone, Navigation, Clock, MapPin, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeliveryAgentCardProps {
  eta: number;
  distance: string;
  deliveryOTP: string;
  delivered: boolean;
}

const DeliveryAgentCard = ({ eta, distance, deliveryOTP, delivered }: DeliveryAgentCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl overflow-hidden shadow-elegant border border-white/20 animate-fade-in-scale">
      {/* ── Agent Header (glassmorphism) ─────────────────────────── */}
      <div className="glass flex items-center gap-3 p-4 border-b border-white/20">
        {/* Avatar with gradient border */}
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-full p-0.5"
            style={{ background: "linear-gradient(135deg, hsl(180,60%,65%), hsl(25,85%,55%))" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
          {/* Online dot */}
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        </div>

        {/* Name / vehicle */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight">Murugan S.</p>
          <p className="text-xs text-muted-foreground mt-0.5">TN 09 AB 1234 &nbsp;·&nbsp; 🛵 Two-wheeler</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              En route
            </span>
          </div>
        </div>

        {/* Call button with ripple */}
        <a
          href="tel:+919876543210"
          className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden
                     bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30
                     hover:scale-105 active:scale-95 transition-transform duration-150"
          aria-label="Call delivery agent"
        >
          {/* Ripple ring */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
          <Phone className="w-5 h-5 text-white relative z-10" />
        </a>
      </div>

      {/* ── Stat Pills ──────────────────────────────────────────── */}
      <div className="glass flex items-center justify-around px-4 py-3 gap-2">
        {/* ETA pill */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-primary text-sm">
              {delivered ? "—" : `${eta} min`}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
            {t("tracking.eta")}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border/60" />

        {/* Distance pill */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span className="font-bold text-secondary text-sm">
              {delivered ? "0 m" : distance}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Distance</span>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border/60" />

        {/* OTP pill */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold text-amber-700 text-sm tracking-[0.15em]">{deliveryOTP}</span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">OTP</span>
        </div>
      </div>

      {/* ── Proximity Alert (slide-in) ───────────────────────────── */}
      {!delivered && eta <= 5 && (
        <div className="glass border-t border-amber-200/40 px-4 py-2.5 animate-slide-up">
          <div className="flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4 text-amber-600 animate-bounce" />
            <p className="text-sm font-semibold text-amber-700">
              Agent is just {eta} min away — get ready!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentCard;
