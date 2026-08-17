import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Phone, CreditCard, QrCode, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginProps {
  onLogin: (rationNumber: string, mobile: string) => void;
}

const demoAccounts = [
  { rationCard: "123456789012", mobile: "9876543210", familyCount: 2 },
  { rationCard: "234567890123", mobile: "9876543211", familyCount: 3 },
  { rationCard: "345678901234", mobile: "9876543212", familyCount: 4 },
  { rationCard: "456789012345", mobile: "9876543213", familyCount: 5 },
];

type LoginTab = "manual" | "qr";

const Login = ({ onLogin }: LoginProps) => {
  const { t } = useLanguage();
  const [rationNumber, setRationNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<LoginTab>("manual");
  const [qrStatus, setQrStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [qrError, setQrError] = useState("");
  const scannerRef = useRef<any>(null);
  const readerDivId = "qr-reader";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // state 2 = scanning
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore
      }
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setQrStatus("scanning");
    setQrError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await stopScanner();

      const scanner = new Html5Qrcode(readerDivId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const cleaned = decodedText.replace(/\D/g, "");
          const match = cleaned.match(/\d{12}/);
          if (match) {
            setRationNumber(match[0]);
            setQrStatus("success");
            scanner.stop().catch(() => {});
          } else {
            setQrStatus("error");
            setQrError(t("login.qrInvalid"));
          }
        },
        () => {
          // ignore scan failures (no QR in frame)
        }
      );
    } catch {
      setQrStatus("error");
      setQrError(t("login.qrCameraError"));
      setActiveTab("manual");
    }
  }, [stopScanner, t]);

  useEffect(() => {
    if (activeTab === "qr" && qrStatus !== "success") {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [activeTab]);

  const handleTabSwitch = (tab: LoginTab) => {
    if (tab === activeTab) return;
    stopScanner();
    setQrStatus("idle");
    setQrError("");
    setActiveTab(tab);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(rationNumber, mobileNumber);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 overflow-hidden bg-white shadow-lg border-2 border-primary/20">
            <img src="/tn-logo.png" alt="Government of Tamil Nadu" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("login.title")}</h1>
          <h2 className="text-2xl font-semibold text-primary mb-1">{t("login.subtitle")}</h2>
          <p className="text-muted-foreground">{t("login.tagline")}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">{t("login.heading")}</CardTitle>
            <CardDescription className="text-center">
              {t("login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Switcher */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch("manual")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                  activeTab === "manual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {t("login.tabRation")}
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("qr")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                  activeTab === "qr"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="w-4 h-4" />
                {t("login.tabQR")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Manual Entry Tab */}
              {activeTab === "manual" && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label htmlFor="ration-number" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {t("login.rationCard")}
                  </Label>
                  <Input
                    id="ration-number"
                    type="text"
                    placeholder={t("login.rationCardPlaceholder")}
                    value={rationNumber}
                    onChange={e => setRationNumber(e.target.value)}
                    required
                    maxLength={12}
                    className="text-center text-lg tracking-wider"
                  />
                </div>
              )}

              {/* QR Scanner Tab */}
              {activeTab === "qr" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {qrStatus === "success" ? (
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-semibold text-primary">{t("login.qrSuccess")}</p>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">{t("login.rationCard")}</p>
                        <p className="text-lg font-mono tracking-widest">{rationNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        id={readerDivId}
                        className="w-full rounded-lg overflow-hidden border-2 border-dashed border-primary/40 min-h-[260px] flex items-center justify-center bg-muted/50"
                      >
                        {qrStatus === "scanning" && (
                          <div className="text-center text-muted-foreground p-4">
                            <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                            <p className="text-sm">{t("login.qrScanning")}</p>
                          </div>
                        )}
                      </div>
                      {qrError && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md p-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {qrError}
                        </div>
                      )}
                      <p className="text-xs text-center text-muted-foreground">
                        {t("login.qrHelper")}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Mobile number - always visible */}
              <div className="space-y-2">
                <Label htmlFor="mobile-number" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t("login.mobile")}
                </Label>
                <Input
                  id="mobile-number"
                  type="tel"
                  placeholder={t("login.mobilePlaceholder")}
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  required
                  maxLength={10}
                  className="text-center text-lg tracking-wider"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                disabled={isLoading || rationNumber.length !== 12 || mobileNumber.length !== 10}
              >
                {isLoading ? t("login.verifying") : t("login.button")}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>{t("login.security")}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Shield className="w-3 h-3" />
                  <span>{t("login.encrypted")}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t("login.help")}</p>
          <p className="mt-1">{t("login.helpline")}</p>
          <div className="mt-4 p-3 bg-card rounded-lg border">
            <p className="font-semibold text-foreground mb-2">{t("login.demoAccounts")}</p>
            {demoAccounts.map((account, idx) => (
              <p key={idx} className="text-xs">
                Ration: {account.rationCard} | Mobile: {account.mobile} ({account.familyCount} {t("login.members")})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
