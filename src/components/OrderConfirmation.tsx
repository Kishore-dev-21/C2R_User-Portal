import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Banknote,
  CheckCircle,
  Package,
  Fingerprint,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderItem {
  id: string;
  quantity: number;
}

interface OrderConfirmationProps {
  selectedProducts: OrderItem[];
  totalAmount: number;
  onBack: () => void;
  onConfirm: () => void;
}

const productDetails: Record<string, { nameKey: string; unit: string; price: number }> = {
  rice: { nameKey: "product.rice", unit: "kg", price: 3 },
  wheat: { nameKey: "product.wheat", unit: "kg", price: 2 },
  sugar: { nameKey: "product.sugar", unit: "kg", price: 13.5 },
  oil: { nameKey: "product.oil", unit: "litre", price: 25 },
  dhal: { nameKey: "product.dhal", unit: "kg", price: 60 },
  salt: { nameKey: "product.salt", unit: "kg", price: 6 },
};

const OrderConfirmation = ({ selectedProducts, totalAmount, onBack, onConfirm }: OrderConfirmationProps) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [deliverySlot, setDeliverySlot] = useState("afternoon");
  const [isProcessing, setIsProcessing] = useState(false);

  const timeSlots = [
    { id: "morning", label: t("order.morning"), time: "9:00 AM - 12:00 PM", available: true },
    { id: "afternoon", label: t("order.afternoon"), time: "2:00 PM - 5:00 PM", available: true },
    { id: "evening", label: t("order.evening"), time: "6:00 PM - 8:00 PM", available: false },
  ];

  const handleConfirm = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
    }, 2000);
  };

  const deliveryCharge = 10;
  const finalAmount = totalAmount + deliveryCharge;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("order.title")}</h1>
              <p className="text-muted-foreground">{t("order.description")}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t("order.deliveryAddress")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-1">Ramesh Kumar</div>
                  <div className="text-sm text-muted-foreground">
                    No. 123, Gandhi Street, T. Nagar<br />
                    Chennai - 600017, Tamil Nadu<br />
                    Mobile: +91 98765 43210
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("order.selectTime")}
                </CardTitle>
                <CardDescription>
                  {t("order.preferredSlot")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliverySlot} onValueChange={setDeliverySlot}>
                  <div className="space-y-3">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          slot.available 
                            ? "cursor-pointer hover:bg-muted/50" 
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <RadioGroupItem 
                          value={slot.id} 
                          id={slot.id} 
                          disabled={!slot.available}
                        />
                        <Label 
                          htmlFor={slot.id} 
                          className={`flex-1 ${slot.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{slot.label}</div>
                              <div className="text-sm text-muted-foreground">{slot.time}</div>
                            </div>
                            {!slot.available && (
                              <Badge variant="destructive" className="text-xs">
                                {t("order.unavailable")}
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t("order.paymentMethod")}
                </CardTitle>
                <CardDescription>
                  {t("order.paymentOption")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{t("order.upiPayment")}</div>
                            <div className="text-sm text-muted-foreground">{t("order.upiDescription")}</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{t("order.card")}</div>
                            <div className="text-sm text-muted-foreground">{t("order.cardDescription")}</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{t("order.cash")}</div>
                            <div className="text-sm text-muted-foreground">{t("order.cashDescription")}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-success/20 bg-success/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-6 h-6 text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-success mb-2">{t("order.biometricVerification")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("order.biometricDescription")}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      • {t("order.biometricBenefit1")}<br />
                      • {t("order.biometricBenefit2")}<br />
                      • {t("order.biometricBenefit3")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t("order.orderSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedProducts.map((item) => {
                    const product = productDetails[item.id];
                    if (!product) return null;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{t(product.nameKey)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} {product.unit} × ₹{product.price}
                          </div>
                        </div>
                        <div className="font-semibold">
                          ₹{(item.quantity * product.price).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("order.subtotal")}</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("order.deliveryFee")}</span>
                    <span>₹{deliveryCharge}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>{t("order.total")}</span>
                    <span className="text-lg text-secondary">₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  {isProcessing ? t("order.processing") : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("order.confirmOrder")}
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>🔒 {t("order.protected")}</p>
                  <p>📱 {t("order.smsUpdates")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;