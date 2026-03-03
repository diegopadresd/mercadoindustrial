
CREATE OR REPLACE FUNCTION public.get_brand_counts()
RETURNS TABLE(brand text, product_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand, COUNT(*)::bigint as product_count
  FROM public.products
  WHERE is_active = true
    AND seller_id IS NULL
    AND brand IS NOT NULL
    AND trim(brand) != ''
    AND brand NOT IN ('SIN MARCA', 'Sin marca')
  GROUP BY brand
  ORDER BY COUNT(*) DESC;
$$;
