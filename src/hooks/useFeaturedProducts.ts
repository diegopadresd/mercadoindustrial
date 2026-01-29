import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedProduct {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  category: string | null;
  brand: string | null;
  link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<FeaturedProduct[]> => {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return data || [];
    },
  });
};
