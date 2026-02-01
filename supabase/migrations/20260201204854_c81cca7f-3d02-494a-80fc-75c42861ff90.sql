-- Add auction fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_auction boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auction_min_price numeric,
ADD COLUMN IF NOT EXISTS auction_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS auction_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS auction_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS contact_for_quote boolean DEFAULT false;

-- Create auction_status enum check constraint
ALTER TABLE public.products 
ADD CONSTRAINT check_auction_status 
CHECK (auction_status IN ('inactive', 'scheduled', 'active', 'ended_valid', 'ended_invalid', 'sold'));

-- Create bids table for auction bids
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_winning boolean DEFAULT false
);

-- Enable RLS on bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Anyone can view bids for active auctions
CREATE POLICY "Anyone can view bids" 
ON public.bids 
FOR SELECT 
USING (true);

-- Authenticated users can place bids
CREATE POLICY "Authenticated users can place bids" 
ON public.bids 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all bids
CREATE POLICY "Admins can manage all bids" 
ON public.bids 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Add index for faster bid queries
CREATE INDEX idx_bids_product_id ON public.bids(product_id);
CREATE INDEX idx_bids_amount ON public.bids(amount DESC);

-- Enable realtime for bids table (for live auction updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;