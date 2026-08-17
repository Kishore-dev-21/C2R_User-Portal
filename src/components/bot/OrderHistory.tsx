import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  items: any;
  total_amount: number;
  status: string;
  delivery_date: string | null;
  created_at: string;
}

const OrderHistory = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'dispatched':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'ta') {
      const statusMap: Record<string, string> = {
        pending: 'நிலுவையில்',
        confirmed: 'உறுதிப்படுத்தப்பட்டது',
        preparing: 'தயாராகிறது',
        dispatched: 'அனுப்பப்பட்டது',
        delivered: 'வழங்கப்பட்டது',
        cancelled: 'ரத்து செய்யப்பட்டது',
      };
      return statusMap[status] || status;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
        </p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{language === 'ta' ? 'ஆர்டர்கள் இல்லை' : 'No orders yet'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        {language === 'ta' ? 'ஆர்டர் வரலாறு' : 'Order History'}
      </h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">#{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {language === 'ta' ? 'தொகை' : 'Amount'}: ₹{order.total_amount}
                </p>
                {order.delivery_date && (
                  <p className="text-muted-foreground">
                    {language === 'ta' ? 'விநியோக தேதி' : 'Delivery'}: {format(new Date(order.delivery_date), 'dd MMM yyyy')}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default OrderHistory;
