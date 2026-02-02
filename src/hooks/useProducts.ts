import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

export const useProducts = (options?: {
  category?: string;
  brand?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
  officialOnly?: boolean; // seller_id IS NULL (Mercado Industrial)
  externalOnly?: boolean; // seller_id IS NOT NULL (Vendedores externos)
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Filter by seller type
      if (options?.officialOnly) {
        query = query.is('seller_id', null);
      }
      
      if (options?.externalOnly) {
        query = query.not('seller_id', 'is', null);
      }

      if (options?.category) {
        query = query.contains('categories', [options.category]);
      }

      if (options?.brand) {
        query = query.eq('brand', options.brand);
      }

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,sku.ilike.%${options.search}%,brand.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .eq('is_active', true);

      if (error) throw error;
      
      const uniqueBrands = [...new Set(data.map(p => p.brand))];
      return uniqueBrands.sort();
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('categories')
        .eq('is_active', true);

      if (error) throw error;
      
      const allCategories = data.flatMap(p => p.categories || []);
      const uniqueCategories = [...new Set(allCategories)];
      return uniqueCategories.sort();
    },
  });
};
