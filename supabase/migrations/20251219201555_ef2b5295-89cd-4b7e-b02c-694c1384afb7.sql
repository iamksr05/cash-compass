-- Add burn category enum
CREATE TYPE public.burn_category AS ENUM ('survival', 'growth', 'waste');

-- Add new columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS burn_category burn_category,
ADD COLUMN IF NOT EXISTS is_experiment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_founder_draw boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS experiment_notes text;

-- Create scheduled_payments table for payment calendar
CREATE TABLE public.scheduled_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'subscription', -- subscription, salary, rent, other
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  recurring_frequency TEXT, -- weekly, monthly, yearly
  reminder_days INTEGER DEFAULT 3, -- days before to remind
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scheduled_payments
ALTER TABLE public.scheduled_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scheduled_payments
CREATE POLICY "Users can view their own scheduled payments" 
ON public.scheduled_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled payments" 
ON public.scheduled_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled payments" 
ON public.scheduled_payments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled payments" 
ON public.scheduled_payments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_alerts table for panic alerts and notifications
CREATE TABLE public.user_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- runway_critical, expense_spike, consecutive_loss, payment_due
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_alerts
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_alerts
CREATE POLICY "Users can view their own alerts" 
ON public.user_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" 
ON public.user_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.user_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.user_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for scheduled_payments updated_at
CREATE TRIGGER update_scheduled_payments_updated_at
BEFORE UPDATE ON public.scheduled_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();