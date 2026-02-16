
-- Extract weight (peso) - replace comma with dot for numeric conversion
UPDATE public.products
SET peso_aprox_kg = REPLACE(
  (regexp_match(
    regexp_replace(description, '<[^>]+>', ' ', 'g'),
    'Peso[:\s]*(\d+[\.,]?\d*)\s*kg',
    'i'
  ))[1], ',', '.'
)::numeric
WHERE peso_aprox_kg IS NULL
AND description ~* 'Peso[:\s]*\d+[\.,]?\d*\s*kg';

-- Extract dimensions: largo
UPDATE public.products
SET largo_aprox_cm = REPLACE(
  (regexp_match(
    regexp_replace(description, '<[^>]+>', ' ', 'g'),
    'Medidas?[:\s]*(\d+[\.,]?\d*)\s*x\s*\d+[\.,]?\d*\s*x\s*\d+',
    'i'
  ))[1], ',', '.'
)::numeric
WHERE largo_aprox_cm IS NULL
AND description ~* 'Medidas?[:\s]*\d+[\.,]?\d*\s*x\s*\d+[\.,]?\d*\s*x\s*\d+';

-- Extract dimensions: ancho
UPDATE public.products
SET ancho_aprox_cm = REPLACE(
  (regexp_match(
    regexp_replace(description, '<[^>]+>', ' ', 'g'),
    'Medidas?[:\s]*\d+[\.,]?\d*\s*x\s*(\d+[\.,]?\d*)\s*x\s*\d+',
    'i'
  ))[1], ',', '.'
)::numeric
WHERE ancho_aprox_cm IS NULL
AND description ~* 'Medidas?[:\s]*\d+[\.,]?\d*\s*x\s*\d+[\.,]?\d*\s*x\s*\d+';

-- Extract dimensions: alto
UPDATE public.products
SET alto_aprox_cm = REPLACE(
  (regexp_match(
    regexp_replace(description, '<[^>]+>', ' ', 'g'),
    'Medidas?[:\s]*\d+[\.,]?\d*\s*x\s*\d+[\.,]?\d*\s*x\s*(\d+[\.,]?\d*)',
    'i'
  ))[1], ',', '.'
)::numeric
WHERE alto_aprox_cm IS NULL
AND description ~* 'Medidas?[:\s]*\d+[\.,]?\d*\s*x\s*\d+[\.,]?\d*\s*x\s*\d+';

-- Weight from lbs
UPDATE public.products
SET peso_aprox_kg = ROUND(
  REPLACE(
    (regexp_match(
      regexp_replace(description, '<[^>]+>', ' ', 'g'),
      'Weight[:\s]*(\d+[\.,]?\d*)\s*lbs?',
      'i'
    ))[1], ',', '.'
  )::numeric * 0.4536, 2
)
WHERE peso_aprox_kg IS NULL
AND description ~* 'Weight[:\s]*\d+[\.,]?\d*\s*lbs?';

-- Extract model
UPDATE public.products
SET model = TRIM((
  regexp_match(
    regexp_replace(description, '<[^>]+>', ' ', 'g'),
    'Modelo[:\s]+([A-Za-z0-9\-\/\.\s]{2,40})',
    'i'
  )
)[1])
WHERE model IS NULL
AND description ~* 'Modelo[:\s]+[A-Za-z0-9]';
