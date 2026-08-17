import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, X, Package, Truck, CreditCard, Phone, RotateCcw, Calendar, AlertCircle, Star, Image as ImageIcon, History } from 'lucide-react';
import AppointmentBooking from './bot/AppointmentBooking';
import ComplaintForm from './bot/ComplaintForm';
import OrderHistory from './bot/OrderHistory';
import RatingDialog from './bot/RatingDialog';
import ImageUpload from './bot/ImageUpload';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

type DialogType = 'appointment' | 'complaint' | 'rating' | 'image' | 'history' | null;

const RationBot = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map(msg => ({
          role: msg.role as 'user' | 'bot',
          content: msg.message,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (role: 'user' | 'bot', content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('chat_history').insert({
        user_id: user.id,
        role,
        message: content,
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveChatMessage('user', textToSend);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rationbot-chat', {
        body: {
          message: textToSend,
          language,
          context: window.location.pathname,
          chatHistory: messages.slice(-10),
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        role: 'bot',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      saveChatMessage('bot', data.response);
    } catch (error: any) {
      console.error('RationBot error:', error);
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: error.message || (language === 'ta' ? 'ஏதோ தவறு நடந்தது' : 'Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('chat_history').delete().eq('user_id', user.id);
      }
      setMessages([]);
      toast({
        title: language === 'ta' ? 'அரட்டை அழிக்கப்பட்டது' : 'Chat Cleared',
        description: language === 'ta' ? 'புதிய உரையாடலைத் தொடங்கவும்' : 'Start a new conversation',
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const quickActions = [
    {
      icon: Package,
      label: language === 'ta' ? 'இருப்பு சரிபார்' : 'Check Stock',
      message: language === 'ta' ? 'இன்று என்ன பொருட்கள் கிடைக்கும்?' : 'What items are available today?'
    },
    {
      icon: Truck,
      label: language === 'ta' ? 'விநியோகம் கண்காணி' : 'Track Order',
      message: language === 'ta' ? 'என் ரேஷன் எப்போது வரும்?' : 'When will my ration arrive? Show delivery status.'
    },
    {
      icon: Calendar,
      label: language === 'ta' ? 'சந்திப்பு பதிவு' : 'Book Slot',
      action: () => setActiveDialog('appointment')
    },
    {
      icon: ImageIcon,
      label: language === 'ta' ? 'அட்டை சரிபார்' : 'Verify Card',
      action: () => setActiveDialog('image')
    },
    {
      icon: CreditCard,
      label: language === 'ta' ? 'கட்டணம்' : 'Payment',
      message: language === 'ta' ? 'எப்படி பணம் செலுத்துவது?' : 'What payment methods can I use?'
    },
    {
      icon: Star,
      label: language === 'ta' ? 'மதிப்பீடு' : 'Rate',
      action: () => setActiveDialog('rating')
    },
    {
      icon: AlertCircle,
      label: language === 'ta' ? 'புகார்' : 'Complaint',
      action: () => setActiveDialog('complaint')
    },
    {
      icon: History,
      label: language === 'ta' ? 'வரலாறு' : 'History',
      action: () => setActiveDialog('history')
    },
    {
      icon: Phone,
      label: language === 'ta' ? 'உதவி: 1234' : 'Help: 1234',
      message: language === 'ta' ? 'எனக்கு உதவி தேவை' : 'I need help. What is the support number?'
    }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-500 to-orange-600 hover:scale-105"
        size="icon"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          <Bot className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
        </div>
      </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-elegant flex flex-col bg-background border-primary/20 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-white">RationBot AI</h3>
                <p className="text-xs text-white/90">
                  {language === 'ta' ? '24/7 உதவி சேவை' : '24/7 Smart Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  title={language === 'ta' ? 'அரட்டை அழி' : 'Clear chat'}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground space-y-4 py-4">
                <div className="text-5xl mb-2">🤖</div>
                <h4 className="font-bold text-lg text-foreground">
                  {language === 'ta' 
                    ? 'வணக்கம்! நான் RationBot AI' 
                    : 'Hello! I\'m RationBot AI'}
                </h4>
                <p className="text-sm px-4">
                  {language === 'ta' 
                    ? 'நான் உங்களுக்கு ரேஷன் விநியோகத்தில் உதவ இங்கே இருக்கிறேன். எதைப் பற்றியும் கேளுங்கள்!' 
                    : 'I\'m here to help you with ration distribution. Ask me anything about stock, delivery, payments, or support!'}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 px-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => action.action ? action.action() : sendMessage(action.message!)}
                      className="flex flex-col h-auto py-2 gap-1 hover:bg-orange-50 hover:border-orange-400 hover:shadow-md transition-all duration-200 dark:hover:bg-orange-950/30"
                    >
                      <action.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-[10px] font-medium leading-tight">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-secondary/30">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={language === 'ta' ? 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' : 'Type your question here...'}
                disabled={isLoading}
                className="flex-1 bg-background"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {language === 'ta' ? 'எதைப் பற்றியும் கேளுங்கள் - நான் உதவ தயாராக இருக்கிறேன்!' : 'Ask anything - I\'m here to help!'}
            </p>
          </div>
        </Card>
      )}

      {/* Feature Dialogs */}
      <Dialog open={activeDialog !== null} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeDialog === 'appointment' && <AppointmentBooking onClose={() => setActiveDialog(null)} />}
          {activeDialog === 'complaint' && <ComplaintForm onClose={() => setActiveDialog(null)} />}
          {activeDialog === 'rating' && <RatingDialog onClose={() => setActiveDialog(null)} />}
          {activeDialog === 'image' && <ImageUpload onClose={() => setActiveDialog(null)} />}
          {activeDialog === 'history' && <OrderHistory />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RationBot;
