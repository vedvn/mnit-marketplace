-- MNIT Marketplace Analytics Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Analytics Table
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('PAGE_VIEW', 'PRODUCT_INTERACTION')),
    path TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.site_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON public.site_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.site_analytics(event_type);

-- 2. RLS (Only Admins/Employees can read; anyone can insert via service role/headless)
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.site_analytics;
CREATE POLICY "Anyone can insert analytics" ON public.site_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view analytics" ON public.site_analytics;
CREATE POLICY "Staff can view analytics" ON public.site_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = true OR is_employee = true))
);

-- 3. Views for Ranking

-- Product Performance View (Ranking)
CREATE OR REPLACE VIEW public.v_product_performance AS
SELECT 
    p.id as product_id,
    p.title,
    p.category_id,
    c.name as category_name,
    COUNT(CASE WHEN sa.event_type = 'PAGE_VIEW' THEN 1 END) as views,
    COUNT(CASE WHEN sa.event_type = 'PRODUCT_INTERACTION' THEN 1 END) as interactions,
    (COUNT(CASE WHEN sa.event_type = 'PAGE_VIEW' THEN 1 END) + (COUNT(CASE WHEN sa.event_type = 'PRODUCT_INTERACTION' THEN 1 END) * 5)) as rank_score
FROM 
    public.products p
JOIN 
    public.categories c ON p.category_id = c.id
LEFT JOIN 
    public.site_analytics sa ON p.id = sa.product_id
WHERE 
    p.status = 'AVAILABLE'
GROUP BY 
    p.id, p.title, p.category_id, c.name
ORDER BY 
    rank_score DESC;

-- Page Traffic View
CREATE OR REPLACE VIEW public.v_page_traffic AS
SELECT 
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT created_at::date) as active_days
FROM 
    public.site_analytics
WHERE 
    event_type = 'PAGE_VIEW'
GROUP BY 
    path
ORDER BY 
    total_views DESC;
