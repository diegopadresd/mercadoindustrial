import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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

const CATALOG_COLUMNS = 'id,title,sku,brand,price,original_price,images,location,categories,is_new,is_featured,is_auction,auction_min_price,auction_end,contact_for_quote,created_at,updated_at,seller_id,is_active' as const;

function buildCatalogQuery(options: CatalogOptions) {
  const { page, perPage, search, categories, brands, locations, sortBy, officialOnly } = options;

  let query = supabase
    .from('products')
    .select(CATALOG_COLUMNS, { count: 'exact' })
    .eq('is_active', true);

  if (officialOnly) {
    query = query.is('seller_id', null);
  }

  if (search?.trim()) {
    query = query.or(
      `title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (categories && categories.length > 0) {
    query = query.overlaps('categories', categories);
  }

  if (brands && brands.length > 0) {
    query = query.in('brand', brands);
  }

  if (locations && locations.length > 0) {
    query = query.in('location', locations);
  }

  switch (sortBy) {
    case 'recientes':
      query = query.order('created_at', { ascending: false });
      break;
    case 'destacados':
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'precio-asc':
      query = query.gt('price', 0).order('price', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
      break;
    case 'precio-desc':
      query = query.gt('price', 0).order('price', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
      break;
    case 'nombre':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  return query;
}

async function fetchCatalog(options: CatalogOptions): Promise<CatalogResult> {
  const { data, error, count } = await buildCatalogQuery(options);
  if (error) throw error;
  return {
    products: (data || []) as Product[],
    count: count || 0,
  };
}

export const useCatalogProducts = (options: CatalogOptions) => {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['catalog-products', options],
    queryFn: () => fetchCatalog(options),
    staleTime: 60_000, // Cache pages for 1 min
    placeholderData: (prev) => prev,
  });

  // Prefetch next page
  const totalPages = result.data ? Math.ceil(result.data.count / options.perPage) : 0;
  useEffect(() => {
    if (options.page < totalPages) {
      const nextOpts = { ...options, page: options.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ['catalog-products', nextOpts],
        queryFn: () => fetchCatalog(nextOpts),
        staleTime: 60_000,
      });
    }
  }, [options.page, totalPages, queryClient, options]);

  return result;
};
