import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home, Download, MapPin, Calendar, Hash,
  Truck, Receipt, ChevronDown, ChevronUp, ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeliverySimulation } from "@/hooks/useDeliverySimulation";
import DeliveryMap from "@/components/tracking/DeliveryMap";
import StatusTimeline from "@/components/tracking/StatusTimeline";
import DeliveryAgentCard from "@/components/tracking/DeliveryAgentCard";
import DeliveryOTPVerification from "@/components/tracking/DeliveryOTPVerification";
import DeliveryRatingDialog from "@/components/tracking/DeliveryRatingDialog";
import jsPDF from "jspdf";
import { TN_LOGO_BASE64 } from "@/assets/tn-logo-base64";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface OrderItem  { id: string; quantity: number; }
interface TrackingPageProps {
  onReturnHome:      () => void;
  selectedProducts?: OrderItem[];
  totalAmount?:      number;
}

const productDetails: Record<string, { nameKey: string; unit: string; price: number; emoji: string }> = {
  rice:  { nameKey: "product.rice",  unit: "kg",    price: 3,    emoji: "🍚" },
  wheat: { nameKey: "product.wheat", unit: "kg",    price: 2,    emoji: "🌾" },
  sugar: { nameKey: "product.sugar", unit: "kg",    price: 13.5, emoji: "🍯" },
  oil:   { nameKey: "product.oil",   unit: "litre", price: 25,   emoji: "🛢️" },
  dhal:  { nameKey: "product.dhal",  unit: "kg",    price: 60,   emoji: "🫘" },
  salt:  { nameKey: "product.salt",  unit: "kg",    price: 6,    emoji: "🧂" },
};

/* ── Component ──────────────────────────────────────────────────────────── */
const TrackingPage = ({
  onReturnHome,
  selectedProducts = [],
  totalAmount      = 0,
}: TrackingPageProps) => {
  const { t }  = useLanguage();
  const sim    = useDeliverySimulation();
  const orderId = "#RH240113001";
  const [orderOpen, setOrderOpen] = useState(true);

  /* ── Derived order data ─────────────────────────────────────────────── */
  const orderItems = selectedProducts.map((item) => {
    const d = productDetails[item.id];
    return {
      name:  d ? t(d.nameKey) : item.id,
      qty:   `${item.quantity} ${d?.unit ?? ""}`,
      price: `₹${(item.quantity * (d?.price ?? 0)).toFixed(2)}`,
      emoji: d?.emoji ?? "📦",
      id:    item.id,
      rawQty: item.quantity,
    };
  });

  const deliveryCharge = 10;
  const displayTotal   = totalAmount > 0 ? totalAmount : 0;
  const finalAmount    = displayTotal + deliveryCharge;

  /* ── PDF receipt ────────────────────────────────────────────────────── */
  const downloadReceipt = () => {
    const doc   = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const now   = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Header
    doc.setFillColor(0, 101, 77);
    doc.rect(0, 0, pageW, 38, "F");

    try {
      doc.addImage(TN_LOGO_BASE64, "PNG", 10, 4, 20, 20);
    } catch (e) {
      doc.setFillColor(255, 215, 0); doc.circle(20, 19, 10, "F");
      doc.setFillColor(0, 101, 77);  doc.circle(20, 19,  8, "F");
      doc.setFillColor(255, 215, 0); doc.circle(20, 19,  5, "F");
      doc.setFillColor(0, 101, 77);  doc.circle(20, 19,  3, "F");
    }

    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255);
    doc.text("Click2Ration", pageW/2, 14, { align:"center" });
    doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.text("Government of Tamil Nadu  |  Civil Supplies & Consumer Protection Dept.", pageW/2, 21, { align:"center" });
    doc.setFontSize(9);
    doc.text("Official Order Receipt  |  TNPDS Digital Service", pageW/2, 27.5, { align:"center" });

    doc.setFillColor(255,153,0); doc.rect(0,38,pageW,2.5,"F");
    doc.setFillColor(255,255,255); doc.rect(0,40.5,pageW,2.5,"F");
    doc.setFillColor(19,136,8);   doc.rect(0,43,pageW,2.5,"F");

    let y = 52;

    // Order meta
    doc.setFillColor(240,247,244);
    doc.roundedRect(10,y,pageW-20,28,3,3,"F");
    doc.setDrawColor(0,101,77); doc.setLineWidth(0.4);
    doc.roundedRect(10,y,pageW-20,28,3,3,"S");

    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(0,101,77);
    doc.text("ORDER ID",18,y+8); doc.text("DATE",80,y+8); doc.text("TIME",130,y+8); doc.text("STATUS",168,y+8);

    doc.setFontSize(11); doc.setTextColor(30,30,30);
    doc.text(orderId,18,y+18); doc.setFontSize(9);
    doc.text(dateStr,80,y+18); doc.text(timeStr,130,y+18);

    const statusText:string = sim.delivered ? "DELIVERED" : "OUT FOR DELIVERY";
    const statusColor:[number,number,number] = sim.delivered ? [19,136,8] : [0,101,77];
    doc.setFillColor(...statusColor);
    doc.roundedRect(163,y+12,32,8,2,2,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(255,255,255);
    doc.text(statusText,179,y+17.5,{ align:"center" });
    y += 34;

    // Address
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(0,101,77);
    doc.text("DELIVERY ADDRESS",10,y);
    doc.setDrawColor(0,101,77); doc.setLineWidth(0.5); doc.line(10,y+1.5,75,y+1.5);
    y += 6;
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(30,30,30);
    doc.text("Ramesh Kumar",10,y); y+=5;
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(60,60,60);
    doc.text("No. 123, Gandhi Street, T. Nagar, Chennai - 600017, Tamil Nadu",10,y); y+=5;
    doc.text("Mobile: +91 98765 43210  |  Ration Card: TN-CHN-2024-00891",10,y); y+=10;

    // Items table
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(0,101,77);
    doc.text("ITEMS ORDERED",10,y);
    doc.setDrawColor(0,101,77); doc.line(10,y+1.5,75,y+1.5); y+=6;

    doc.setFillColor(0,101,77); doc.rect(10,y,pageW-20,8,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(255,255,255);
    doc.text("S.No",15,y+5.5); doc.text("Item Description",32,y+5.5);
    doc.text("Qty",115,y+5.5); doc.text("Unit Rate",135,y+5.5); doc.text("Amount",168,y+5.5);
    y+=8;

    orderItems.forEach((item,idx) => {
      const bg:[number,number,number] = idx%2===0 ? [248,252,250]:[255,255,255];
      doc.setFillColor(...bg); doc.rect(10,y,pageW-20,8,"F");
      doc.setDrawColor(210,230,220); doc.setLineWidth(0.2); doc.rect(10,y,pageW-20,8,"S");
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(40,40,40);
      doc.text(`${idx+1}.`,15,y+5.5); doc.text(item.name,32,y+5.5); doc.text(item.qty,115,y+5.5);
      const price = productDetails[item.id]?.price ?? 0;
      doc.text(`Rs.${price.toFixed(2)}`,135,y+5.5); doc.text(item.price,168,y+5.5);
      y+=8;
    });

    // Totals
    y+=3; doc.setDrawColor(180,210,195); doc.setLineWidth(0.3); doc.line(115,y,pageW-10,y); y+=5;
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(60,60,60);
    doc.text("Sub Total",115,y); doc.text(`Rs.${displayTotal.toFixed(2)}`,168,y); y+=6;
    doc.text("Delivery Charge",115,y); doc.text(`Rs.${deliveryCharge.toFixed(2)}`,168,y); y+=6;
    doc.setDrawColor(0,101,77); doc.setLineWidth(0.5); doc.line(115,y,pageW-10,y); y+=5;
    doc.setFillColor(0,101,77); doc.rect(114,y-1,pageW-124,10,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(255,255,255);
    doc.text("TOTAL AMOUNT",116,y+6); doc.text(`Rs.${finalAmount.toFixed(2)}`,168,y+6); y+=16;

    // Payment / slot
    doc.setFillColor(240,247,244);
    doc.roundedRect(10,y,(pageW-25)/2,18,2,2,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,101,77);
    doc.text("PAYMENT METHOD",15,y+6);
    doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40); doc.text("UPI / Digital Payment",15,y+13);

    const c2x = 15+(pageW-25)/2;
    doc.setFillColor(240,247,244); doc.roundedRect(c2x,y,(pageW-25)/2,18,2,2,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,101,77);
    doc.text("DELIVERY SLOT",c2x+5,y+6);
    doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40); doc.text("Afternoon  |  2:00 PM – 5:00 PM",c2x+5,y+13);
    y+=24;

    // Verification
    doc.setFillColor(232,245,233); doc.roundedRect(10,y,pageW-20,14,2,2,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(0,101,77);
    doc.text("Aadhaar Biometric Verified  |  TNPDS Authenticated  |  Transaction Secured",pageW/2,y+6,{ align:"center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(60,60,60);
    doc.text(`Transaction Ref: TNPDS-${Date.now().toString().slice(-10)}  |  Digitally generated receipt`,pageW/2,y+12,{ align:"center" });
    y+=20;

    // Footer
    doc.setFillColor(0,101,77); doc.rect(0,y,pageW,22,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
    doc.text("Thank you for using Click2Ration!",pageW/2,y+7,{ align:"center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.text("Civil Supplies & Consumer Protection Department, Government of Tamil Nadu",pageW/2,y+13,{ align:"center" });
    doc.text("Helpline: 1967  |  www.tnpds.gov.in  |  click2ration@tn.gov.in",pageW/2,y+19,{ align:"center" });

    doc.save(`Click2Ration-Receipt-${orderId.replace("#","")}-${Date.now()}.pdf`);
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/60 flex flex-col">

      {/* ════════════════════ FLOATING HEADER ════════════════════════════ */}
      <div className="bg-gradient-primary shadow-lg shadow-primary/20 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">{t("tracking.title")}</h1>
                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono font-semibold text-white/90">{orderId}</span>
                  <span>·</span>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* ETA pill — visible on desktop in the header */}
              {!sim.delivered && (
                <div className="hidden sm:flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 border border-white/25">
                  <span className="text-sm">⏱</span>
                  <span className="text-white font-bold text-sm">{sim.eta} min</span>
                  <span className="text-white/60 text-xs">away</span>
                </div>
              )}
              <Badge className={`text-[10px] font-bold border ${sim.delivered
                ? "bg-green-500/30 text-white border-green-400/50"
                : "bg-white/15 text-white border-white/30 animate-pulse"
              }`}>
                {sim.delivered ? "✅ Delivered" : "🟢 Live"}
              </Badge>
            </div>
          </div>

          {/* Status timeline */}
          <StatusTimeline currentStep={sim.currentStep} />
        </div>
      </div>

      {/* ════════════════════ MAIN BODY ══════════════════════════════════ */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 py-4">

        {/* ── Two-column grid (desktop) / stacked (mobile) ─────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 h-full">

          {/* ════ LEFT — MAP PANEL (3 cols) ════════════════════════════ */}
          <div className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ height: "clamp(340px, 55vh, 620px)" }}
            >
              <div className="w-full h-full">
                <DeliveryMap
                  agentPosition={sim.agentPosition}
                  userPosition={sim.userPosition}
                  routeWaypoints={sim.routeWaypoints}
                  bearing={sim.bearing}
                  orderId={orderId}
                  eta={sim.delivered ? undefined : sim.eta}
                />
              </div>
            </div>

            {/* Mobile-only: ETA strip below map */}
            {!sim.delivered && (
              <div className="lg:hidden mt-2 flex items-center justify-center gap-3 bg-primary/10 border border-primary/20 rounded-xl py-2.5 px-4 animate-slide-up">
                <span className="text-xl">⏱</span>
                <span className="font-bold text-primary text-base">{sim.eta} min away</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">{sim.distanceStr}</span>
              </div>
            )}
          </div>

          {/* ════ RIGHT — SIDEBAR (2 cols) ════════════════════════════ */}
          <div className="lg:col-span-2 space-y-3 overflow-y-auto lg:max-h-[calc(100vh-140px)]"
               style={{ scrollbarWidth: "none" }}>

            {/* ── Delivery Agent Card ─────────────────────────────── */}
            <DeliveryAgentCard
              eta={sim.eta}
              distance={sim.distanceStr}
              deliveryOTP={sim.deliveryOTP}
              delivered={sim.delivered}
            />

            {/* ── OTP Verification ────────────────────────────────── */}
            {sim.arrived && !sim.delivered && (
              <div className="animate-slide-up">
                <DeliveryOTPVerification
                  expectedOTP={sim.deliveryOTP}
                  onVerified={sim.confirmDelivery}
                />
              </div>
            )}

            {/* ── Delivered success banner ─────────────────────────── */}
            {sim.delivered && !sim.showRating && (
              <div
                className="rounded-2xl p-5 text-center space-y-2 animate-fade-in-scale border border-green-400/20"
                style={{ background: "linear-gradient(135deg,rgba(22,163,74,.1),rgba(74,222,128,.08))" }}
              >
                <div className="text-4xl">🎉</div>
                <p className="font-bold text-green-700 text-lg">Order Delivered!</p>
                <p className="text-xs text-muted-foreground">Your ration items have been delivered successfully.</p>
              </div>
            )}

            {/* ── Rating dialog ─────────────────────────────────────── */}
            {sim.showRating && (
              <DeliveryRatingDialog orderId={orderId} onClose={sim.dismissRating} />
            )}

            {/* ── Order Summary (collapsible) ──────────────────────── */}
            {orderItems.length > 0 && (
              <div className="rounded-2xl border border-border/40 overflow-hidden shadow-sm bg-card animate-fade-in-scale">

                {/* Header row — click to collapse */}
                <button
                  onClick={() => setOrderOpen(!orderOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-muted/40 border-b border-border/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t("tracking.orderDetails")}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{orderId}</p>
                    </div>
                  </div>
                  {orderOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </button>

                {orderOpen && (
                  <>
                    {/* Address strip */}
                    <div className="flex items-start gap-2 px-4 py-2.5 bg-primary/5 border-b border-border/20">
                      <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">Ramesh Kumar</p>
                        <p className="text-[11px] text-muted-foreground">No. 123, Gandhi Street, T. Nagar, Chennai - 600017</p>
                      </div>
                    </div>

                    {/* Item rows */}
                    <div className="px-4 py-1">
                      {orderItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/15 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg leading-none w-6 text-center">{item.emoji}</span>
                            <div>
                              <p className="text-sm font-medium leading-tight">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">{item.qty}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="px-4 pb-4 pt-2 bg-muted/25 space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span>
                        <span>₹{displayTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Delivery Charge</span>
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{t("tracking.totalPaid")}</span>
                        <span
                          className="font-bold text-lg"
                          style={{ background:"var(--gradient-primary)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
                        >
                          ₹{finalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Action buttons ────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 pb-2">
              <Button
                variant="outline"
                className="h-12 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-semibold gap-1.5"
                onClick={downloadReceipt}
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Button
                className="h-12 text-xs rounded-xl font-semibold gap-1.5 bg-gradient-primary hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
                onClick={onReturnHome}
              >
                <Home className="w-4 h-4" />
                {t("tracking.returnToDashboard")}
              </Button>
            </div>

            {/* Gov footer note */}
            <p className="text-center text-[10px] text-muted-foreground pb-1">
              🏛️ Civil Supplies &amp; Consumer Protection Dept. — Govt. of Tamil Nadu
            </p>
          </div>
          {/* end sidebar */}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
