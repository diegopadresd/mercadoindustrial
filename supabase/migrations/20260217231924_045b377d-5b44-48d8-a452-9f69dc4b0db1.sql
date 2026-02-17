-- Allow manejo role to view all orders (needed for order supervision)
CREATE POLICY "Manejo can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));