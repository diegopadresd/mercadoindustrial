import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

interface CatalogOptions {
  page: number;
  perPage: number;
  search?: string;
  categories?: string[];
  brands?: string[];
  locations?: string[];
  sortBy?: string;
  officialOnly?: boolean;
}

interface CatalogResult {
  products: Product[];
  count: number;
}

export const useCatalogProducts = (options: CatalogOptions) => {
  return useQuery({
    queryKey: ['catalog-products', options],
    queryFn: async (): Promise<CatalogResult> => {
      const { page, perPage, search, categories, brands, locations, sortBy, officialOnly } = options;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (officialOnly) {
        query = query.is('seller_id', null);
      }

      // Server-side search
      if (search?.trim()) {
        query = query.or(
          `title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Server-side category filter (any of selected categories)
      if (categories && categories.length > 0) {
        // Use overlaps to check if product categories array overlaps with selected
        query = query.overlaps('categories', categories);
      }

      // Server-side brand filter
      if (brands && brands.length > 0) {
        query = query.in('brand', brands);
      }

      // Server-side location filter
      if (locations && locations.length > 0) {
        query = query.in('location', locations);
      }

      // Server-side sorting
      switch (sortBy) {
        case 'recientes':
          query = query.order('created_at', { ascending: false });
          break;
        case 'destacados':
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'precio-asc':
          query = query.order('price', { ascending: true, nullsFirst: false });
          break;
        case 'precio-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'nombre':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Server-side pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        products: (data || []) as Product[],
        count: count || 0,
      };
    },
    placeholderData: (prev) => prev, // Keep previous data while loading new page
  });
};
