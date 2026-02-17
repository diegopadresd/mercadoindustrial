
CREATE TABLE public.clients (
  id bigint PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  phone text,
  mobile text,
  company text,
  website text,
  country text,
  region text,
  city text,
  address text,
  postal_code text,
  contact_type text,
  vat text,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  marketing_emails text,
  tags text[],
  custom_fields text,
  notes text,
  imported_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Operators can view clients" ON public.clients
  FOR SELECT USING (has_role(auth.uid(), 'operador'::app_role));

CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_company ON public.clients(company);
CREATE INDEX idx_clients_country ON public.clients(country);
