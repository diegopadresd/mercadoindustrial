
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_clients_first_name_trgm ON public.clients USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_last_name_trgm ON public.clients USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_email_trgm ON public.clients USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_company_trgm ON public.clients USING gin (company gin_trgm_ops);
