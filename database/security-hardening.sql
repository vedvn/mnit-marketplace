-- MNIT Marketplace Security Hardening & TTL Migration
-- Run this in your Supabase SQL Editor

-- 1. Add Deletion Tracking to Users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- 2. Create System Audit Logs Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protect Audit Logs (Only Admins can ever read them, NO ONE can update/delete)
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.system_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.system_audit_logs 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- 2. Tighten User RLS (Prevent Self-Promotion)
-- Dropping existing policy to redefine more strictly
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.users;
CREATE POLICY "Users can update own profile fields" ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Ensure non-admins cannot change their staff status
  (
    is_admin = (SELECT is_admin FROM public.users WHERE id = auth.uid()) AND
    is_employee = (SELECT is_employee FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  )
);

-- 3. Prevent Product Ownership Transfer
-- Ensure that when a seller updates a product, they don't change the seller_id to someone else
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products securely" ON public.products;
CREATE POLICY "Sellers can update their own products securely" ON public.products
FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- 4. TTL Janitor Logic & Account Cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- 4a. Clear expired live camera sessions (TTL: 15 mins)
    DELETE FROM public.live_camera_sessions WHERE expires_at < NOW();
    
    -- 4b. Clear abandoned, old pending transactions (> 7 days)
    DELETE FROM public.transactions WHERE payment_status = 'PENDING' AND created_at < NOW() - INTERVAL '7 days';

    -- 4c. Permanent Account Deletion Cleanup (30-day "Right to be Forgotten")
    -- Privacy Policy Section 03 & 06 Compliance
    DELETE FROM auth.users 
    WHERE id IN (
        SELECT id FROM public.users 
        WHERE deletion_requested_at IS NOT NULL 
        AND deletion_requested_at < NOW() - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
