-- MNIT Reseller Database Schema (Supabase PostgreSQL)
-- Run this in your Supabase SQL Editor

-- 0. Enable Row Level Security (RLS) properly
-- We will enable RLS per table below.

-- 1. Create custom Enums
CREATE TYPE product_status AS ENUM ('PENDING_REVIEW', 'AVAILABLE', 'SOLD', 'REMOVED');
CREATE TYPE product_condition AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE payout_status AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED');

-- 2. Create Users Table
-- Supabase Auth automatically populates auth.users. But we will create a public.users profile table.
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@mnit.ac.in'),
  name TEXT NOT NULL,
  phone_number TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_employee BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_until TIMESTAMPTZ,
  welcome_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Create Categories Table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
-- Admin only insert/update but keeping it simple for now

-- Initial Categories
INSERT INTO public.categories (name) VALUES 
('Electronics'), ('Books'), ('Bicycles'), ('Furniture'), ('Miscellaneous');

-- 4. Create Products Table
CREATE TABLE public.products (
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
CREATE POLICY "Anyone can read available products" ON public.products FOR SELECT USING (status = 'AVAILABLE');
CREATE POLICY "Sellers can view their own products" ON public.products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Employees and Admins can view all products" ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);
CREATE POLICY "Sellers can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Employees and Admins can update products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);

-- 5. Create Transactions Table
CREATE TABLE public.transactions (
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
CREATE POLICY "Users can see their own transactions (as buyer or seller)" 
ON public.transactions FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 6. Create Admin Settings Table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 5.00, -- percentage e.g. 5 = 5%
  is_maintenance_mode BOOLEAN DEFAULT false,
  is_buying_disabled BOOLEAN DEFAULT false
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read admin settings" ON public.admin_settings FOR SELECT USING (true);
INSERT INTO public.admin_settings (platform_fee_percent, is_maintenance_mode, is_buying_disabled) VALUES (5.00, false, false);

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a bucket for product images limit uploads to 2MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('product-images', 'product-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 7. Live Camera Sessions Table (For Desktop-to-Mobile Hand-off)
CREATE TABLE public.live_camera_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '15 minutes')
);

ALTER TABLE public.live_camera_sessions ENABLE ROW LEVEL SECURITY;
-- User who created it can see it
CREATE POLICY "Users can view their own sessions" ON public.live_camera_sessions FOR SELECT USING (auth.uid() = user_id);
-- User who creates it can insert it
CREATE POLICY "Users can create their own sessions" ON public.live_camera_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Mobile uploads are headless (unauthenticated), handled by secure API via Admin Client, so updates don't need public RLS.
