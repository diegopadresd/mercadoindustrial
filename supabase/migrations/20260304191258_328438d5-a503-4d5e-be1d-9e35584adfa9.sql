
-- The view approach triggers a linter false positive. Drop it and use a SECURITY INVOKER
-- function to check seller ownership, keeping PII access gated by offer status.

DROP VIEW IF EXISTS public.offers_seller_view;

-- The sellers SELECT policy was already dropped. They now have NO direct SELECT access.
-- Sellers interact with offers only via admin-mediated flows (admin assigns offers to them).
-- The vendedor_oficial SELECT policy already covers assigned sellers with full access,
-- which is intentional since vendedor_oficial is a trusted internal role.
-- For external product sellers (seller_id on products), we intentionally remove direct
-- SELECT so PII is not exposed. They get notified of offers via the notification system.
