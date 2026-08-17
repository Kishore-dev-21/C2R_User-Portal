import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Clock, ShoppingCart, AlertTriangle, PackageCheck } from "lucide-react";
import { SMSMessage } from "@/hooks/useSMSNotification";
import { useLanguage } from "@/contexts/LanguageContext";

interface SMSPopupProps {
  message: SMSMessage | null;
  onDismiss: () => void;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  otp: { icon: Phone, label: "OTP Verification", color: "bg-blue-500" },
  order: { icon: ShoppingCart, label: "Order Confirmation", color: "bg-green-500" },
  stock_alert: { icon: AlertTriangle, label: "Stock Alert", color: "bg-amber-500" },
  restock: { icon: PackageCheck, label: "Restock Alert", color: "bg-emerald-500" },
  general: { icon: MessageSquare, label: "Notification", color: "bg-primary" },
};

const SMSPopup = ({ message, onDismiss }: SMSPopupProps) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (message && message.message_type !== "otp") {
      const timer = setTimeout(onDismiss, 8000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const config = typeConfig[message.message_type] || typeConfig.general;
  const Icon = config.icon;

  return (
    <Dialog open={!!message} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base">{t("sms.simulatedSMS")}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{config.label}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{t("sms.to")}: {message.phone}</span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
              {message.message_content}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(message.created_at).toLocaleString()}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {t("sms.demoNote")}
            </p>
          </div>
        </div>

        <Button onClick={onDismiss} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          {t("sms.dismiss")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SMSPopup;
