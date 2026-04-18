-- MNIT Reseller Database Schema (Supabase PostgreSQL)
-- Run this in your Supabase SQL Editor

-- 0. Enable Row Level Security (RLS) properly
-- We will enable RLS per table below.

-- 1. Create custom Enums (Idempotent Blocks)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE public.product_status AS ENUM ('PENDING_REVIEW', 'AVAILABLE', 'SOLD', 'REMOVED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_condition') THEN
        CREATE TYPE public.product_condition AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
        CREATE TYPE public.payout_status AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED');
    END IF;
END $$;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@mnit.ac.in'),
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_employee BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_until TIMESTAMPTZ,
  welcome_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2a. Create User Financials Table (Private)
CREATE TABLE IF NOT EXISTS public.user_financials (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_financials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own financials" ON public.user_financials;
CREATE POLICY "Users can view own financials" ON public.user_financials FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Staff can view all financials" ON public.user_financials;
CREATE POLICY "Staff can view all financials" ON public.user_financials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);
DROP POLICY IF EXISTS "Users can update own financials" ON public.user_financials;
CREATE POLICY "Users can update own financials" ON public.user_financials FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own financials" ON public.user_financials;
CREATE POLICY "Users can insert own financials" ON public.user_financials FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
-- Admin only insert/update but keeping it simple for now

-- Initial Categories (Idempotent)
INSERT INTO public.categories (name) VALUES 
('Electronics'), ('Books'), ('Bicycles'), ('Furniture'), ('Miscellaneous')
ON CONFLICT (name) DO NOTHING;

-- 4. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition product_condition NOT NULL,
  pickup_address TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price >= 0),
  images TEXT[] NOT NULL CHECK (array_length(images, 1) >= 1 AND array_length(images, 1) <= 3),
  live_photo_url TEXT,
  status product_status DEFAULT 'PENDING_REVIEW' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read available products" ON public.products;
CREATE POLICY "Anyone can read available products" ON public.products FOR SELECT USING (status = 'AVAILABLE');
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
CREATE POLICY "Sellers can view their own products" ON public.products FOR SELECT USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Employees and Admins can view all products" ON public.products;
CREATE POLICY "Employees and Admins can view all products" ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
CREATE POLICY "Sellers can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Employees and Admins can update products" ON public.products;
CREATE POLICY "Employees and Admins can update products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);

-- 5. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  buyer_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  seller_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_paid DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  seller_payout DECIMAL(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'PENDING' NOT NULL,
  payout_status payout_status DEFAULT 'PENDING' NOT NULL,
  razorpay_order_id TEXT,
  payment_method TEXT,
  payout_scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own transactions (as buyer or seller)" ON public.transactions;
CREATE POLICY "Users can see their own transactions (as buyer or seller)" 
ON public.transactions FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 6. Create Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 5.00, -- percentage e.g. 5 = 5%
  is_maintenance_mode BOOLEAN DEFAULT false,
  is_buying_disabled BOOLEAN DEFAULT false
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read admin settings" ON public.admin_settings;
CREATE POLICY "Anyone can read admin settings" ON public.admin_settings FOR SELECT USING (true);

-- Initial Settings (Only if table is empty)
INSERT INTO public.admin_settings (platform_fee_percent, is_maintenance_mode, is_buying_disabled)
SELECT 5.00, false, false
WHERE NOT EXISTS (SELECT 1 FROM public.admin_settings);

-- Create a Trigger to auto-create public.users when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Double check the email domain just in case
  IF NEW.email NOT LIKE '%@mnit.ac.in' THEN
    RAISE EXCEPTION 'Registration restricted to MNIT students only.';
  END IF;

  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', substring(NEW.email from '(.*)@')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6a. Public images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('product-images', 'product-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Product images are publicly accessible." ON storage.objects;
CREATE POLICY "Product images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Anyone can upload product images." ON storage.objects;
CREATE POLICY "Anyone can upload product images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 6b. Private verification photos bucket (Privacy Section 03)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('verification-photos', 'verification-photos', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Verification photos are restricted" ON storage.objects;
CREATE POLICY "Verification photos are restricted" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'verification-photos' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
    )
);

DROP POLICY IF EXISTS "Users can upload own verification photos" ON storage.objects;
CREATE POLICY "Users can upload own verification photos" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'verification-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Live Camera Sessions Table (For Desktop-to-Mobile Hand-off)
CREATE TABLE IF NOT EXISTS public.live_camera_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '15 minutes')
);

ALTER TABLE public.live_camera_sessions ENABLE ROW LEVEL SECURITY;
-- User who created it can see it
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.live_camera_sessions;
CREATE POLICY "Users can view their own sessions" ON public.live_camera_sessions FOR SELECT USING (auth.uid() = user_id);
-- User who creates it can insert it
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.live_camera_sessions;
CREATE POLICY "Users can create their own sessions" ON public.live_camera_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Mobile uploads are headless (unauthenticated), handled by secure API via Admin Client, so updates don't need public RLS.
