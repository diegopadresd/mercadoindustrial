-- Add counter_offer_price column to offers table
ALTER TABLE public.offers 
ADD COLUMN counter_offer_price numeric NULL;

-- Add counter_offer status to distinguish from regular accepted/rejected
COMMENT ON COLUMN public.offers.counter_offer_price IS 'Price proposed by admin as a counter-offer';