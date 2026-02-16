
-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload invoices
CREATE POLICY "Admins can upload invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
));

-- Allow admins to manage invoice files
CREATE POLICY "Admins can manage invoices"
ON storage.objects FOR ALL
USING (bucket_id = 'invoices' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
));

-- Allow users to download their own invoices (matched by order user_id)
CREATE POLICY "Users can download own invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.invoices i ON i.order_id = o.id
      WHERE o.user_id = auth.uid()
      AND (i.pdf_url LIKE '%' || name OR i.xml_url LIKE '%' || name)
    )
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
);
