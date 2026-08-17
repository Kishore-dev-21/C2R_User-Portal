import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package, 
  IndianRupee,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  id: string;
  nameKey: string;
  unit: string;
  allocated: number;
  consumed: number;
  defaultQuantity: number;
  pricePerUnit: number;
  available: boolean;
  descriptionKey: string;
  image: string;
}

interface ProductSelectionProps {
  familySize: number;
  onBack: () => void;
  onOrderConfirm: (selectedProducts: { id: string; quantity: number }[], totalAmount: number) => void;
}

const products: Product[] = [
  {
    id: "rice",
    nameKey: "product.rice",
    unit: "kg",
    allocated: 20,
    consumed: 12,
    defaultQuantity: 2,
    pricePerUnit: 3,
    available: true,
    descriptionKey: "products.highQuality",
    image: "🍚"
  },
  {
    id: "wheat",
    nameKey: "product.wheat",
    unit: "kg",
    allocated: 5,
    consumed: 2,
    defaultQuantity: 2,
    pricePerUnit: 2,
    available: true,
    descriptionKey: "products.nutritious",
    image: "🌾"
  },
  {
    id: "sugar",
    nameKey: "product.sugar",
    unit: "kg",
    allocated: 2,
    consumed: 0.5,
    defaultQuantity: 1,
    pricePerUnit: 13.5,
    available: true,
    descriptionKey: "products.pureRefined",
    image: "🍯"
  },
  {
    id: "oil",
    nameKey: "product.oil",
    unit: "litre",
    allocated: 2,
    consumed: 1,
    defaultQuantity: 1,
    pricePerUnit: 25,
    available: true,
    descriptionKey: "products.refinedPalm",
    image: "🛢️"
  },
  {
    id: "dhal",
    nameKey: "product.dhal",
    unit: "kg",
    allocated: 3,
    consumed: 1.5,
    defaultQuantity: 1,
    pricePerUnit: 60,
    available: true,
    descriptionKey: "products.highProtein",
    image: "🫘"
  },
  {
    id: "salt",
    nameKey: "product.salt",
    unit: "kg",
    allocated: 1,
    consumed: 0.2,
    defaultQuantity: 1,
    pricePerUnit: 6,
    available: false,
    descriptionKey: "products.iodized",
    image: "🧂"
  },
];

const ProductSelection = ({ familySize, onBack, onOrderConfirm }: ProductSelectionProps) => {
  const { t } = useLanguage();

  const getDefaultQuantity = (productId: string, baseQuantity: number) => {
    if (productId === "rice" || productId === "wheat") {
      switch(familySize) {
        case 2: return 1.5;
        case 3: return 2.5;
        case 4: return 3.5;
        case 5: return 4.5;
        default: return baseQuantity;
      }
    }
    return baseQuantity;
  };
  
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach(product => {
      if (product.available) {
        initial[product.id] = getDefaultQuantity(product.id, product.defaultQuantity);
      }
    });
    return initial;
  });

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const maxQuantity = getDefaultQuantity(productId, product.defaultQuantity);
    const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }));
  };

  const selectedProducts = Object.entries(selectedQuantities).filter(([_, quantity]) => quantity > 0);
  const totalAmount = selectedProducts.reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product ? product.pricePerUnit * quantity : 0);
  }, 0);

  const handleOrderConfirm = () => {
    const orderData = selectedProducts.map(([id, quantity]) => ({ id, quantity }));
    onOrderConfirm(orderData, totalAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("products.title")}</h1>
              <p className="text-muted-foreground">{t("products.description")}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {products.map((product) => {
              const available = product.allocated - product.consumed;
              const selected = selectedQuantities[product.id] || 0;
              const defaultQty = getDefaultQuantity(product.id, product.defaultQuantity);
              
              return (
                <Card key={product.id} className={`shadow-lg ${!product.available ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{product.image}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{t(product.nameKey)}</h3>
                            <p className="text-sm text-muted-foreground">{t(product.descriptionKey)}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">₹{product.pricePerUnit}</div>
                            <div className="text-xs text-muted-foreground">per {product.unit}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant={product.available ? "outline" : "destructive"} className={
                            product.available ? "bg-success/10 text-success border-success" : ""
                          }>
                            {product.available ? `${t("products.default")} ${defaultQty} ${product.unit}` : t("dashboard.outOfStock")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t("products.available")} {available} {product.unit}
                          </span>
                        </div>
                        
                        {product.available && (
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium">{t("products.quantity")}</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, selected - 0.5)}
                                disabled={selected <= 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <Input
                                type="number"
                                value={selected}
                                onChange={(e) => updateQuantity(product.id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-center"
                                min="0"
                                max={defaultQty}
                                step="0.5"
                              />
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, selected + 0.5)}
                                disabled={selected >= defaultQty}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              
                              <span className="text-sm text-muted-foreground ml-2">{product.unit}</span>
                            </div>
                            
                            {selected > 0 && (
                              <div className="ml-auto">
                                <span className="font-semibold text-secondary">
                                  ₹{(selected * product.pricePerUnit).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {t("products.orderSummary")}
                </CardTitle>
                <CardDescription>
                  {t("products.reviewItems")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                    <p>{t("products.noItems")}</p>
                    <p className="text-xs">{t("products.chooseProducts")}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {selectedProducts.map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        if (!product) return null;
                        
                        return (
                          <div key={productId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{t(product.nameKey)}</div>
                              <div className="text-xs text-muted-foreground">
                                {quantity} {product.unit} × ₹{product.pricePerUnit}
                              </div>
                            </div>
                            <div className="font-semibold">
                              ₹{(quantity * product.pricePerUnit).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">{t("products.totalAmount")}</span>
                        <span className="text-lg font-bold text-secondary">₹{totalAmount.toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        onClick={handleOrderConfirm}
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      >
                        <IndianRupee className="w-4 h-4 mr-2" />
                        {t("products.proceedToPayment")}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;