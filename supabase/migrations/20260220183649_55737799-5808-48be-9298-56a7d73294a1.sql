
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  author text NOT NULL DEFAULT 'Equipo Mercado Industrial',
  category text,
  read_time text DEFAULT '5 min',
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

-- Admin/manejo can view all posts (including drafts)
CREATE POLICY "Admin can view all blog posts"
ON public.blog_posts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manejo can view all blog posts"
ON public.blog_posts FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Admin/manejo can create posts
CREATE POLICY "Admin can create blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manejo can create blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'manejo'::app_role));

-- Admin/manejo can update posts
CREATE POLICY "Admin can update blog posts"
ON public.blog_posts FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manejo can update blog posts"
ON public.blog_posts FOR UPDATE
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Admin can delete posts
CREATE POLICY "Admin can delete blog posts"
ON public.blog_posts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
