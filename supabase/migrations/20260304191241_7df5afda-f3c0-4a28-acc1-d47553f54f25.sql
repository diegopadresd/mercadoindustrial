
-- Drop the overly broad seller SELECT policy on offers
DROP POLICY IF EXISTS "Sellers can view offers on their products" ON public.offers;
DROP POLICY IF EXISTS "Sellers can update offers on their products" ON public.offers;

-- Create a security-definer view for sellers that masks customer PII until offer is accepted
CREATE OR REPLACE VIEW public.offers_seller_view AS
SELECT
  id,
  product_id,
  offer_price,
  original_price,
  counter_offer_price,
  status,
  admin_notes,
  assigned_vendor_id,
  responded_at,
  created_at,
  updated_at,
  user_id,
  -- Only expose contact details once an offer is formally accepted
  CASE WHEN status IN ('accepted', 'accepted_pending_payment', 'completed')
    THEN customer_name  ELSE NULL END AS customer_name,
  CASE WHEN status IN ('accepted', 'accepted_pending_payment', 'completed')
    THEN customer_email ELSE NULL END AS customer_email,
  CASE WHEN status IN ('accepted', 'accepted_pending_payment', 'completed')
    THEN customer_phone ELSE NULL END AS customer_phone
FROM public.offers
WHERE EXISTS (
  SELECT 1 FROM public.products
  WHERE products.id = offers.product_id
    AND products.seller_id = auth.uid()
);

-- Sellers can still UPDATE offers on their products (counter-offers, etc.)
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
