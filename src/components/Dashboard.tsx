import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  Calendar,
  User,
  MapPin,
  Truck,
  BellRing
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Commodity {
  id: string;
  nameKey: string;
  unit: string;
  allocated: number;
  consumed: number;
  pricePerUnit: number;
  available: boolean;
}

interface DashboardProps {
  familySize: number;
  onSelectProducts: () => void;
  onBackToLogin: () => void;
  notificationBell?: ReactNode;
  onSendStockAlert?: (productName: string) => void;
}

const commodities: Commodity[] = [
  { id: "rice", nameKey: "product.rice", unit: "kg", allocated: 20, consumed: 12, pricePerUnit: 3, available: true },
  { id: "wheat", nameKey: "product.wheat", unit: "kg", allocated: 5, consumed: 2, pricePerUnit: 2, available: true },
  { id: "sugar", nameKey: "product.sugar", unit: "kg", allocated: 2, consumed: 0.5, pricePerUnit: 13.5, available: true },
  { id: "oil", nameKey: "product.oil", unit: "litre", allocated: 2, consumed: 1, pricePerUnit: 25, available: true },
  { id: "dhal", nameKey: "product.dhal", unit: "kg", allocated: 3, consumed: 1.5, pricePerUnit: 60, available: true },
  { id: "salt", nameKey: "product.salt", unit: "kg", allocated: 1, consumed: 0.2, pricePerUnit: 6, available: false },
];

const recentOrders = [
  { id: "1", date: "2024-01-08", items: "Rice 5kg, Oil 1L", status: "Delivered", amount: "₹40" },
  { id: "2", date: "2024-01-01", items: "Sugar 1kg, Dhal 1kg", status: "Delivered", amount: "₹73.5" },
  { id: "3", date: "2023-12-25", items: "Wheat 3kg, Rice 2kg", status: "Delivered", amount: "₹12" },
];

const Dashboard = ({ familySize, onSelectProducts, onBackToLogin, notificationBell, onSendStockAlert }: DashboardProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onBackToLogin} className="text-sm">
              {t("dashboard.backToLogin")}
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground">{t("dashboard.welcome")}, Ramesh Kumar</p>
            </div>
            <div className="flex items-center gap-2">
              {notificationBell}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{familySize} {t("dashboard.members")}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-lg font-semibold">6</div>
                <div className="text-xs text-muted-foreground">{t("dashboard.availableItems")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <div className="text-lg font-semibold">2-4h</div>
                <div className="text-xs text-muted-foreground">{t("dashboard.deliveryTime")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-success" />
                <div className="text-lg font-semibold">Jan 2024</div>
                <div className="text-xs text-muted-foreground">{t("dashboard.currentMonth")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-lg font-semibold">{t("dashboard.home")}</div>
                <div className="text-xs text-muted-foreground">{t("dashboard.deliveryAddress")}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t("dashboard.commodities")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.allocation")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {commodities.map((commodity) => (
                <div key={commodity.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{t(commodity.nameKey)}</h3>
                      {commodity.available ? (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                          {t("dashboard.available")}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge variant="destructive" className="text-xs">
                            {t("dashboard.outOfStock")}
                          </Badge>
                          {onSendStockAlert && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => onSendStockAlert(t(commodity.nameKey))}
                            >
                              <BellRing className="w-3 h-3 mr-1" />
                              {t("dashboard.notifyMe")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{commodity.pricePerUnit}/{commodity.unit}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {commodity.consumed}/{commodity.allocated} {commodity.unit}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(((commodity.allocated - commodity.consumed) / commodity.allocated) * 100)}% {t("dashboard.remaining")}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(commodity.consumed / commodity.allocated) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
              
              <Button 
                onClick={onSelectProducts}
                className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t("dashboard.selectProducts")}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("dashboard.recentOrders")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.purchaseHistory")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{order.items}</div>
                        <div className="text-xs text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{order.amount}</div>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-success/10 text-success border-success"
                        >
                          {t("dashboard.delivered")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t("dashboard.deliveryInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{t("dashboard.deliveryAddress")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No. 123, Gandhi Street, T. Nagar<br />
                    Chennai - 600017, Tamil Nadu
                  </p>
                </div>
                
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">{t("dashboard.nextSlot")}</span>
                  </div>
                  <p className="text-sm text-success">
                    {t("dashboard.today")}, 2:00 PM - 4:00 PM
                  </p>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">🔒 {t("dashboard.biometricRequired")}</p>
                  <p className="text-xs">{t("dashboard.secureDelivery")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
