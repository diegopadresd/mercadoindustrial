-- Allow manejo role to view all products (needed for approval workflow)
CREATE POLICY "Manejo can view all products"
ON public.products
FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Allow manejo role to update products (needed to approve/reject)
CREATE POLICY "Manejo can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'manejo'::app_role));