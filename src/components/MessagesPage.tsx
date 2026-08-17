import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageSquare, Phone, ShoppingCart, AlertTriangle, PackageCheck, CheckCheck, Inbox } from "lucide-react";
import { SMSMessage } from "@/hooks/useSMSNotification";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessagesPageProps {
  messages: SMSMessage[];
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const typeIcons: Record<string, React.ElementType> = {
  otp: Phone,
  order: ShoppingCart,
  stock_alert: AlertTriangle,
  restock: PackageCheck,
  general: MessageSquare,
};

const typeColors: Record<string, string> = {
  otp: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  order: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  stock_alert: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  restock: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const MessagesPage = ({ messages, onBack, onMarkAsRead, onMarkAllAsRead }: MessagesPageProps) => {
  const { t } = useLanguage();
  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{t("sms.messagesTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {messages.length} {t("sms.messages")} • {unread} {t("sms.unread")}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1" />
              {t("sms.markAllRead")}
            </Button>
          )}
        </div>

        {messages.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg mb-1">{t("sms.noMessages")}</h3>
              <p className="text-sm text-muted-foreground">{t("sms.noMessagesDesc")}</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-3">
              {messages.map((msg) => {
                const Icon = typeIcons[msg.message_type] || MessageSquare;
                const colorClass = typeColors[msg.message_type] || typeColors.general;

                return (
                  <Card
                    key={msg.id}
                    className={`shadow-sm cursor-pointer transition-all hover:shadow-md ${!msg.is_read ? "border-primary/40 bg-primary/5" : ""}`}
                    onClick={() => onMarkAsRead(msg.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {msg.message_type.replace("_", " ")}
                            </Badge>
                            {!msg.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground leading-relaxed">
                            {msg.message_content}
                          </pre>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {msg.phone}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
