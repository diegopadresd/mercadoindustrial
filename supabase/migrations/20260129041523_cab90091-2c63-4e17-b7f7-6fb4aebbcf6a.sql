-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create featured_products table for admin-managed featured items
CREATE TABLE public.featured_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(12, 2),
  category TEXT,
  brand TEXT,
  link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view featured products)
CREATE POLICY "Featured products are viewable by everyone" 
ON public.featured_products 
FOR SELECT 
USING (is_active = true);

-- Create policy for authenticated users to manage (temporary - later restrict to admins)
CREATE POLICY "Authenticated users can manage featured products" 
ON public.featured_products 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_featured_products_updated_at
BEFORE UPDATE ON public.featured_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample featured products
INSERT INTO public.featured_products (title, description, image_url, price, category, brand, display_order) VALUES
('Torno CNC Industrial', 'Torno de control numérico de alta precisión para manufactura', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 85000.00, 'Maquinaria CNC', 'Haas', 1),
('Soldadora MIG/MAG 400A', 'Equipo de soldadura profesional para trabajo pesado', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400', 45000.00, 'Soldadura', 'Lincoln Electric', 2),
('Compresor Industrial 200HP', 'Compresor de tornillo rotativo de alta capacidad', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400', 120000.00, 'Compresores', 'Atlas Copco', 3),
('Grúa Puente 10 Ton', 'Sistema de grúa puente para manejo de materiales pesados', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400', 350000.00, 'Manejo de Materiales', 'Konecranes', 4);