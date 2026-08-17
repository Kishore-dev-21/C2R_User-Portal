import { useState, useCallback } from "react";
import Login from "@/components/Login";
import OTPVerification from "@/components/OTPVerification";
import Dashboard from "@/components/Dashboard";
import ProductSelection from "@/components/ProductSelection";
import OrderConfirmation from "@/components/OrderConfirmation";
import TrackingPage from "@/components/TrackingPage";
import MessagesPage from "@/components/MessagesPage";
import LanguageToggle from "@/components/LanguageToggle";
import RationBot from "@/components/RationBot";
import SMSPopup from "@/components/SMSPopup";
import NotificationBell from "@/components/NotificationBell";
import { useSMSNotification } from "@/hooks/useSMSNotification";
import { toast } from "@/hooks/use-toast";

type AppState = "login" | "otp" | "dashboard" | "products" | "confirmation" | "tracking" | "messages";

interface OrderItem {
  id: string;
  quantity: number;
}

const productNames: Record<string, string> = {
  rice: "Premium Rice",
  wheat: "Whole Wheat",
  sugar: "Refined Sugar",
  oil: "Palm Oil",
  dhal: "Toor Dhal",
  salt: "Iodized Salt",
};

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("login");
  const [userMobile, setUserMobile] = useState("");
  const [rationNumber, setRationNumber] = useState("");
  const [familySize, setFamilySize] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState("");

  const sms = useSMSNotification();

  const handleLogin = (rationNum: string, mobile: string) => {
    setUserMobile(mobile);
    setRationNumber(rationNum);

    // Generate OTP and send simulated SMS
    const otp = sms.generateOTP();
    setGeneratedOTP(otp);

    const otpMessage = `Click2Ration OTP: ${otp}\n\nDo not share this OTP with anyone.\nValid for 5 minutes.`;
    sms.sendSMS(mobile, otpMessage, "otp");

    toast({
      title: "📱 OTP Sent",
      description: `Simulated SMS sent to ${mobile}`,
    });

    setCurrentState("otp");
  };

  const handleOTPVerify = (selectedMembers: string[]) => {
    const familySizeMap: Record<string, number> = {
      "123456789012": 2,
      "234567890123": 3,
      "345678901234": 4,
      "456789012345": 5,
    };
    setFamilySize(familySizeMap[rationNumber] || 2);
    setCurrentState("dashboard");
  };

  const handleProductSelection = () => {
    setCurrentState("products");
  };

  const handleOrderConfirm = (products: OrderItem[], total: number) => {
    setSelectedProducts(products);
    setOrderTotal(total);
    setCurrentState("confirmation");
  };

  const handleFinalConfirm = useCallback(() => {
    const orderId = `CR-${Date.now().toString(36).toUpperCase()}`;
    const productList = selectedProducts
      .map(p => `${productNames[p.id] || p.id} x${p.quantity}`)
      .join(", ");
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dateStr = deliveryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setCurrentState("tracking");
  }, [selectedProducts, orderTotal, userMobile, sms]);

  const handleReturnHome = () => {
    setCurrentState("dashboard");
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "login":
        return <Login onLogin={handleLogin} />;
      case "otp":
        return (
          <OTPVerification
            mobileNumber={userMobile}
            rationNumber={rationNumber}
            onVerify={handleOTPVerify}
            expectedOTP={generatedOTP}
            onResendOTP={() => {
              const otp = sms.generateOTP();
              setGeneratedOTP(otp);
              const msg = `Click2Ration OTP: ${otp}\n\nDo not share this OTP with anyone.\nValid for 5 minutes.`;
              sms.sendSMS(userMobile, msg, "otp");
              toast({ title: "📱 OTP Resent", description: `New OTP sent to ${userMobile}` });
            }}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            familySize={familySize}
            onSelectProducts={handleProductSelection}
            onBackToLogin={() => setCurrentState("login")}
            notificationBell={
              <NotificationBell
                unreadCount={sms.unreadCount}
                onClick={() => setCurrentState("messages")}
              />
            }
            onSendStockAlert={(productName: string) => {
              const msg = `${productName} is currently out of stock.\n\nYou will be notified when available.`;
              sms.sendSMS(userMobile, msg, "stock_alert");
              toast({ title: "📦 Stock Alert", description: `You'll be notified when ${productName} is back` });
            }}
          />
        );
      case "products":
        return (
          <ProductSelection
            familySize={familySize}
            onBack={() => setCurrentState("dashboard")}
            onOrderConfirm={handleOrderConfirm}
          />
        );
      case "confirmation":
        return (
          <OrderConfirmation
            selectedProducts={selectedProducts}
            totalAmount={orderTotal}
            onBack={() => setCurrentState("products")}
            onConfirm={handleFinalConfirm}
          />
        );
      case "tracking":
        return <TrackingPage onReturnHome={handleReturnHome} selectedProducts={selectedProducts} totalAmount={orderTotal} />;
      case "messages":
        return (
          <MessagesPage
            messages={sms.messages}
            onBack={() => setCurrentState("dashboard")}
            onMarkAsRead={sms.markAsRead}
            onMarkAllAsRead={sms.markAllAsRead}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <>
      <LanguageToggle />
      {renderCurrentView()}
      <RationBot />
      <SMSPopup message={sms.currentPopup} onDismiss={sms.dismissPopup} />
    </>
  );
};

export default Index;
