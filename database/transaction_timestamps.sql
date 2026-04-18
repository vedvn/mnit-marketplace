-- Add confirmation timestamp to transactions for full transparency
-- Run this in your Supabase SQL Editor

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ;

-- Refresh the view/cache
COMMENT ON COLUMN public.transactions.buyer_confirmed_at IS 'Direct record of the millisecond the buyer clicked Confirm Received in their dashboard.';
