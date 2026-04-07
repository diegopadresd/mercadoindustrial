import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductHistoryEntry {
  id: string;
  product_id: string;
  user_id: string;
  event_type: string;
  previous_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
}

export const useProductHistory = (productId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['product-history', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_history')
        .select('*')
        .eq('product_id', productId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProductHistoryEntry[];
    },
    enabled: !!productId,
  });

  const addEntry = useMutation({
    mutationFn: async (entry: {
      product_id: string;
      event_type: string;
      previous_value?: string;
      new_value?: string;
      reason?: string;
    }) => {
      const { error } = await supabase.from('product_history').insert({
        ...entry,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-history'] });
    },
  });

  return { history, isLoading, addEntry };
};
