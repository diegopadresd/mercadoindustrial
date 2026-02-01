-- Add seller_id column to products table for vendor ownership
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add company_id column to profiles for multi-tenant support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_id uuid;

-- Add status column to profiles for account activation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create invitations table for user invites
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'vendedor',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id uuid,
  status text NOT NULL DEFAULT 'pending',
  token text UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all invitations
CREATE POLICY "Admins can manage all invitations"
ON public.invitations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Users can view their own invitations by email
CREATE POLICY "Users can view invitations by email"
ON public.invitations
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update products RLS to allow vendors to manage their own products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Admins and operators can manage all products"
ON public.products
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Vendors can manage own products"
ON public.products
FOR ALL
USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'vendedor'))
WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'vendedor'));

-- Add index for seller_id
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);