-- Allow users to insert order_items for their own orders
CREATE POLICY "Users can insert items for their own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()))
  )
);

-- Allow users to view items from their own orders
CREATE POLICY "Users can view items from their own orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()))
  )
);