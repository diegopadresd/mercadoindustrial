
-- Add slug column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Populate existing rows: slugify(title)
UPDATE public.products
SET slug = regexp_replace(
  regexp_replace(
    lower(
      translate(
        title,
        'áéíóúàèìòùäëïöüâêîôûñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑÇ',
        'aeiouaeiouaeiouaeiouaeiounçaeiouaeiouaeiouaeiounC'
      )
    ),
    '[^a-z0-9]+', '-', 'g'
  ),
  '^-+|-+$', '', 'g'
)
WHERE slug IS NULL;

-- Create trigger function to auto-fill slug on INSERT if not provided
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := regexp_replace(
      regexp_replace(
        lower(
          translate(
            NEW.title,
            'áéíóúàèìòùäëïöüâêîôûñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑÇ',
            'aeiouaeiouaeiouaeiouaeiounçaeiouaeiouaeiouaeiounC'
          )
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_product_slug_trigger
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_product_slug();
