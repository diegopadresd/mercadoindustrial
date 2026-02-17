
-- Allow manejo to manage invoices
CREATE POLICY "Manejo can view all invoices"
ON public.invoices
FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));

CREATE POLICY "Manejo can insert invoices"
ON public.invoices
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'manejo'::app_role));

CREATE POLICY "Manejo can update invoices"
ON public.invoices
FOR UPDATE
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Allow manejo to upload/read from invoices storage bucket
CREATE POLICY "Manejo can upload invoices"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND has_role(auth.uid(), 'manejo'::app_role));

CREATE POLICY "Manejo can read invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'manejo'::app_role));

CREATE POLICY "Manejo can update invoices storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'manejo'::app_role));
