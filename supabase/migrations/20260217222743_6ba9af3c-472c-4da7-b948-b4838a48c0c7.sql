
-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM (
  'nuevo',
  'contactado',
  'cotizacion_enviada',
  'espera_pago',
  'pagado',
  'perdido'
);

-- Create leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  client_company text,
  product_id text REFERENCES public.products(id),
  offer_id uuid REFERENCES public.offers(id),
  status lead_status NOT NULL DEFAULT 'nuevo',
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all leads"
  ON public.leads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add columns to existing tables
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS assigned_vendor_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_by_vendor uuid;

-- RLS for vendedor_oficial
CREATE POLICY "Vendedor oficial can view clients"
  ON public.clients FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can view all products"
  ON public.products FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can view questions"
  ON public.product_questions FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can view tickets"
  ON public.support_tickets FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can view offers"
  ON public.offers FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can update assigned offers"
  ON public.offers FOR UPDATE
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role) AND assigned_vendor_id = auth.uid());

CREATE POLICY "Vendedor oficial can view own vendor orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role) AND created_by_vendor = auth.uid());

CREATE POLICY "Vendedor oficial can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'vendedor_oficial'::app_role) AND created_by_vendor = auth.uid());

CREATE POLICY "Vendedor oficial can update own vendor orders"
  ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role) AND created_by_vendor = auth.uid());

CREATE POLICY "Vendedor oficial can view profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'vendedor_oficial'::app_role));

CREATE POLICY "Vendedor oficial can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.created_by_vendor = auth.uid()
  ));

CREATE POLICY "Vendedor oficial can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.created_by_vendor = auth.uid()
  ));
