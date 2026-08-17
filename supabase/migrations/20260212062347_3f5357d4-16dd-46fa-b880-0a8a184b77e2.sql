
-- SMS Messages table for simulated SMS notifications
CREATE TABLE public.sms_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SMS messages"
  ON public.sms_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMS messages"
  ON public.sms_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS messages"
  ON public.sms_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Stock notification subscriptions
CREATE TABLE public.stock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock notifications"
  ON public.stock_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock notifications"
  ON public.stock_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock notifications"
  ON public.stock_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock notifications"
  ON public.stock_notifications FOR DELETE
  USING (auth.uid() = user_id);
