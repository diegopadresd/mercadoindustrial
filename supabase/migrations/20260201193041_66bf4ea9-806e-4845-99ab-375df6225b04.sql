-- Add shipping-related columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS peso_aprox_kg numeric,
ADD COLUMN IF NOT EXISTS largo_aprox_cm numeric,
ADD COLUMN IF NOT EXISTS ancho_aprox_cm numeric,
ADD COLUMN IF NOT EXISTS alto_aprox_cm numeric,
ADD COLUMN IF NOT EXISTS cp_origen text;