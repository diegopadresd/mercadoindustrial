
-- Add warehouse_code column to store internal location codes
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warehouse_code text;

-- Copy current location to warehouse_code (preserve original data)
UPDATE public.products SET warehouse_code = location WHERE location IS NOT NULL;

-- Now map locations to real branch names based on patterns
-- TJ suffix = Tijuana
UPDATE public.products SET location = 'Tijuana' WHERE warehouse_code ILIKE '%TJ%' OR warehouse_code ILIKE '%TJ';

-- MXI / PATIO MXI = Mexicali
UPDATE public.products SET location = 'Mexicali' WHERE warehouse_code ILIKE '%MXI%' OR warehouse_code ILIKE '%PATIO MXI%';

-- HILLO = Hermosillo
UPDATE public.products SET location = 'Hermosillo' WHERE warehouse_code ILIKE '%HILLO%';

-- MTY = Santa Catarina (Monterrey)
UPDATE public.products SET location = 'Santa Catarina' WHERE warehouse_code ILIKE '%MTY%';

-- COAH = Coahuila
UPDATE public.products SET location = 'Coahuila' WHERE warehouse_code ILIKE '%COAH%';

-- AZ = Nogales, AZ
UPDATE public.products SET location = 'Nogales, AZ' WHERE warehouse_code = 'AZ' OR warehouse_code ILIKE '%NOG%';

-- ALL/ALA = could be multiple locations, set null for public
UPDATE public.products SET location = NULL WHERE warehouse_code IN ('ALL', 'ALA');

-- TALLER = internal, hide from public
UPDATE public.products SET location = NULL WHERE warehouse_code = 'TALLER';

-- For remaining codes that are just rack codes (A1, A2, B1 RO8, etc.) without branch suffix, set location to NULL
-- These are internal warehouse codes only
UPDATE public.products SET location = NULL 
WHERE location IS NOT NULL 
AND location NOT IN ('Tijuana', 'Mexicali', 'Hermosillo', 'Santa Catarina', 'Coahuila', 'Nogales, AZ');
