
CREATE TABLE public.product_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  previous_value text,
  new_value text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all product history"
  ON public.product_history FOR ALL
  TO public
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view all product history"
  ON public.product_history FOR SELECT
  TO public
  USING (
    public.has_role(auth.uid(), 'operador') OR
    public.has_role(auth.uid(), 'manejo') OR
    public.has_role(auth.uid(), 'vendedor_oficial')
  );

CREATE POLICY "Staff can insert product history"
  ON public.product_history FOR INSERT
  TO public
  WITH CHECK (
    public.has_role(auth.uid(), 'operador') OR
    public.has_role(auth.uid(), 'manejo') OR
    public.has_role(auth.uid(), 'vendedor_oficial')
  );

CREATE POLICY "Vendors can view own product history"
  ON public.product_history FOR SELECT
  TO public
  USING (
    public.has_role(auth.uid(), 'vendedor') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_history.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert own product history"
  ON public.product_history FOR INSERT
  TO public
  WITH CHECK (
    public.has_role(auth.uid(), 'vendedor') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_history.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE INDEX idx_product_history_product_id ON public.product_history(product_id);
CREATE INDEX idx_product_history_created_at ON public.product_history(created_at DESC);
