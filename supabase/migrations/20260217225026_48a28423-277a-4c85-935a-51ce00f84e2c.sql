
-- Add approval_status to products for vendor submission workflow
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';
-- Values: 'draft', 'pending_approval', 'approved', 'rejected'
-- Existing products are all 'approved' by default

-- Add tracking fields to orders for operator processing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_company text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS processed_by uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;

-- Allow operators to update orders (for processing)
CREATE POLICY "Operators can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Operators can update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'operador'::app_role));

-- Allow operators to view order items
CREATE POLICY "Operators can view all order items"
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'operador'::app_role));
