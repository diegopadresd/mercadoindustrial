
-- 1. Add allow_offers boolean to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allow_offers boolean DEFAULT false;

-- 2. Add GIN index for fast text search on title, sku, brand
CREATE INDEX IF NOT EXISTS products_search_gin_idx 
ON public.products USING gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(brand,'')));

-- 3. Create get_category_list RPC to return distinct categories efficiently
CREATE OR REPLACE FUNCTION public.get_category_list()
RETURNS TABLE(category text, product_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT unnested_cat AS category, COUNT(*)::bigint AS product_count
  FROM public.products,
       unnest(categories) AS unnested_cat
  WHERE is_active = true
    AND seller_id IS NULL
  GROUP BY unnested_cat
  ORDER BY unnested_cat ASC;
$$;
