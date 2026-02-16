
-- Temporarily disable FK constraints to allow ID migration
ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
ALTER TABLE public.offers DROP CONSTRAINT offers_product_id_fkey;
ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE public.product_questions DROP CONSTRAINT product_questions_product_id_fkey;
ALTER TABLE public.bids DROP CONSTRAINT bids_product_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT conversations_product_id_fkey;

-- Update the products table
UPDATE public.products SET id = REPLACE(id, 'django-', '') WHERE id LIKE 'django-%';

-- Update all references
UPDATE public.offers SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';
UPDATE public.cart_items SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';
UPDATE public.order_items SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';
UPDATE public.product_questions SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';
UPDATE public.bids SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';
UPDATE public.conversations SET product_id = REPLACE(product_id, 'django-', '') WHERE product_id LIKE 'django-%';

-- Re-add FK constraints
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.offers ADD CONSTRAINT offers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.product_questions ADD CONSTRAINT product_questions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.bids ADD CONSTRAINT bids_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.conversations ADD CONSTRAINT conversations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
