import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, CheckCircle, ShieldCheck } from "lucide-react";

interface DeliveryOTPVerificationProps {
  expectedOTP: string;
  onVerified:  () => void;
}

const DeliveryOTPVerification = ({ expectedOTP, onVerified }: DeliveryOTPVerificationProps) => {
  const [otp,      setOtp]      = useState("");
  const [error,    setError]    = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (otp === expectedOTP) {
      setVerified(true);
      setError(false);
      setTimeout(onVerified, 1600);
    } else {
      setError(true);
    }
  };

  if (verified) {
    return (
      <Card className="rounded-2xl border-green-400/30 overflow-hidden animate-fade-in-scale shadow-lg">
        {/* Success gradient header */}
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(90deg,#16a34a,#4ade80,#16a34a)" }}
        />
        <CardContent className="p-8 flex flex-col items-center gap-4">
          {/* Emoji burst */}
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-3 -left-4 text-xl animate-bounce" style={{ animationDelay:"0ms"   }}>🎉</span>
            <span className="absolute -top-5  right-0 text-lg animate-bounce" style={{ animationDelay:"150ms" }}>✨</span>
            <span className="absolute  bottom-0 -right-4 text-xl animate-bounce" style={{ animationDelay:"300ms" }}>🎊</span>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/40 animate-fade-in-scale">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-green-600 text-xl">Delivery Verified!</p>
            <p className="text-sm text-muted-foreground">
              Your ration order has been delivered successfully. Thank you for using Click2Ration!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-primary/20 overflow-hidden shadow-lg animate-slide-up">
      {/* Gradient header bar */}
      <div className="bg-gradient-primary p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Fingerprint className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-primary-foreground text-sm">Delivery OTP Verification</p>
          <p className="text-xs text-primary-foreground/70">Show OTP to agent to confirm receipt</p>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Security note */}
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200/60 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            This OTP ensures only you receive the delivery. Never share it before the agent arrives at your doorstep.
          </p>
        </div>

        {/* OTP input */}
        <div className="flex justify-center py-1">
          <InputOTP
            maxLength={4}
            value={otp}
            onChange={(v) => { setOtp(v); setError(false); }}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-16 h-16 text-2xl font-bold rounded-2xl border-2 border-primary/20 focus:border-primary transition-all duration-200 shadow-sm"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="text-destructive text-sm text-center font-medium animate-slide-up">
            ❌ Incorrect OTP. Please try again.
          </p>
        )}

        <Button
          onClick={handleVerify}
          disabled={otp.length < 4}
          className="w-full h-13 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25
                     bg-gradient-primary hover:opacity-90 transition-all duration-200 active:scale-[.98]"
          style={{ height: "52px" }}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verify & Confirm Delivery
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliveryOTPVerification;
