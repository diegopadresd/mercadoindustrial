-- Create seller_applications table for pending vendor approvals
CREATE TABLE public.seller_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    ine_url TEXT,
    birth_date DATE NOT NULL,
    company_name TEXT,
    items_description TEXT NOT NULL,
    rfc TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- Users can create their own application
CREATE POLICY "Users can create own application"
ON public.seller_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own application
CREATE POLICY "Users can view own application"
ON public.seller_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON public.seller_applications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Operadores can view and update applications
CREATE POLICY "Operadores can view applications"
ON public.seller_applications
FOR SELECT
USING (has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Operadores can update applications"
ON public.seller_applications
FOR UPDATE
USING (has_role(auth.uid(), 'operador'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_seller_applications_updated_at
BEFORE UPDATE ON public.seller_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for INE documents
INSERT INTO storage.buckets (id, name, public) VALUES ('seller-documents', 'seller-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for seller documents
CREATE POLICY "Users can upload own INE"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'seller-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'seller-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all seller documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'seller-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Operadores can view all seller documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'seller-documents' AND has_role(auth.uid(), 'operador'::app_role));