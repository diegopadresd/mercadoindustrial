
-- Add view_count column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create a SECURITY DEFINER function to safely increment view counts
-- (bypasses RLS so anyone can increment, including anonymous users)
CREATE OR REPLACE FUNCTION public.increment_product_view(_product_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = _product_id;
$$;

-- Grant execute to anon and authenticated so all visitors can call it
GRANT EXECUTE ON FUNCTION public.increment_product_view(text) TO anon, authenticated;
