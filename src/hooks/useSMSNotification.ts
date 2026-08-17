import { useState, useCallback } from "react";

export interface SMSMessage {
  id: string;
  phone: string;
  message_content: string;
  message_type: "otp" | "order" | "stock_alert" | "restock" | "general";
  is_read: boolean;
  created_at: string;
}

export const useSMSNotification = () => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [currentPopup, setCurrentPopup] = useState<SMSMessage | null>(null);

  const sendSMS = useCallback((
    phone: string,
    content: string,
    type: SMSMessage["message_type"] = "general"
  ) => {
    const msg: SMSMessage = {
      id: crypto.randomUUID(),
      phone,
      message_content: content,
      message_type: type,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [msg, ...prev]);
    setCurrentPopup(msg);
    return msg;
  }, []);

  const dismissPopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, is_read: true } : m))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
  }, []);

  const unreadCount = messages.filter(m => !m.is_read).length;

  const generateOTP = useCallback((): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  return {
    messages,
    currentPopup,
    sendSMS,
    dismissPopup,
    markAsRead,
    markAllAsRead,
    unreadCount,
    generateOTP,
  };
};
