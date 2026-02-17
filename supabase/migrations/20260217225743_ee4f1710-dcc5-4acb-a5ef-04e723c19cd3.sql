
-- Add review_notes column for admin feedback on product submissions
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_notes text;
