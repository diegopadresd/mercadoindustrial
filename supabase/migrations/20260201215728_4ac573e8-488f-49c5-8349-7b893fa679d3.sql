-- Allow sellers to view offers on their own products
CREATE POLICY "Sellers can view offers on their products"
ON public.offers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = offers.product_id
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to update offers on their products (accept/reject)
CREATE POLICY "Sellers can update offers on their products"
ON public.offers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = offers.product_id
    AND products.seller_id = auth.uid()
  )
);