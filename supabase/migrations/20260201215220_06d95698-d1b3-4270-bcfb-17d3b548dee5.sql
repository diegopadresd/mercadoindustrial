-- Add new product fields for industrial equipment details
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS hours_of_use INTEGER,
ADD COLUMN IF NOT EXISTS is_functional BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS has_warranty BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warranty_duration TEXT,
ADD COLUMN IF NOT EXISTS warranty_conditions TEXT;