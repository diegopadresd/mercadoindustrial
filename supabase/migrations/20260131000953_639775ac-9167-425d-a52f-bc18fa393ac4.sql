-- 1. Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table (for security - never store roles in profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'México',
  rfc TEXT,
  fiscal_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create products table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC,
  original_price NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 1,
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 6. Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.order_type AS ENUM ('purchase', 'quote');

-- 7. Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'México',
  rfc TEXT,
  requires_invoice BOOLEAN DEFAULT false,
  fiscal_document_url TEXT,
  order_type order_type NOT NULL DEFAULT 'purchase',
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC,
  total_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 9. Create product_questions table
CREATE TABLE public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answered_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

-- 10. Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  xml_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- User roles: users can view their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: users manage their own, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Products: everyone can view active, admins can manage
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cart items: users manage their own, guests use session
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Guests can manage session cart" ON public.cart_items
  FOR ALL USING (session_id IS NOT NULL AND user_id IS NULL);

-- Orders: users view own, admins view all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order items: same as orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Questions: public questions visible to all, users can ask
CREATE POLICY "Anyone can view public questions" ON public.product_questions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can ask questions" ON public.product_questions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR customer_email IS NOT NULL);

CREATE POLICY "Admins can manage all questions" ON public.product_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Invoices: users view own, admins manage all
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'MI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Storage bucket for fiscal documents
INSERT INTO storage.buckets (id, name, public) VALUES ('fiscal-documents', 'fiscal-documents', false);

CREATE POLICY "Users can upload own fiscal docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fiscal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own fiscal docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'fiscal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all fiscal docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'fiscal-documents' AND public.has_role(auth.uid(), 'admin'));