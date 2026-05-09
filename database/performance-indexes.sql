-- MNIT Marketplace & Notes Hub Performance Indexes
-- Run this in your Supabase SQL Editor to prevent full table scans on foreign keys

-- 1. Products Table Indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- 2. Transactions Table Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);

-- 3. Notes Table Indexes (assuming these exist based on server actions)
CREATE INDEX IF NOT EXISTS idx_notes_uploader_id ON public.notes(uploader_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject);

-- 4. Note Likes & Downloads (if they exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'note_likes') THEN
        CREATE INDEX IF NOT EXISTS idx_note_likes_note_id ON public.note_likes(note_id);
        CREATE INDEX IF NOT EXISTS idx_note_likes_user_id ON public.note_likes(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'note_downloads') THEN
        CREATE INDEX IF NOT EXISTS idx_note_downloads_note_id ON public.note_downloads(note_id);
        CREATE INDEX IF NOT EXISTS idx_note_downloads_user_id ON public.note_downloads(user_id);
    END IF;
END $$;
