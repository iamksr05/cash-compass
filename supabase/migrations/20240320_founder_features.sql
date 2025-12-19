
-- Migration to add Founder-Centric columns to transactions table

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS burn_category text CHECK (burn_category IN ('survival', 'growth', 'waste')),
ADD COLUMN IF NOT EXISTS is_experiment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS experiment_notes text,
ADD COLUMN IF NOT EXISTS is_founder_draw boolean DEFAULT false;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
