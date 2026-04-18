-- Dispute status enumeration
CREATE TYPE dispute_status AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- Disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL, -- This will be encrypted in the application layer
  status dispute_status DEFAULT 'OPEN' NOT NULL,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- 1. Users can see disputes they've raised
CREATE POLICY "Users can view their own disputes" 
ON public.disputes FOR SELECT 
USING (auth.uid() = raised_by);

-- 2. Staff (Admins and Employees) can see all disputes
CREATE POLICY "Staff can view all disputes" 
ON public.disputes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (is_admin = true OR is_employee = true)
  )
);

-- 3. Users can insert their own disputes
CREATE POLICY "Users can raise their own disputes" 
ON public.disputes FOR INSERT 
WITH CHECK (auth.uid() = raised_by);

-- 4. Staff can update disputes (for resolution)
CREATE POLICY "Staff can update disputes" 
ON public.disputes FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (is_admin = true OR is_employee = true)
  )
);
