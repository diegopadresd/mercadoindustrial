import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductAIResult {
  identified: boolean;
  title?: string;
  sku?: string;
  brand?: string;
  price?: number;
  categories?: string[];
  description?: string;
  confidence?: 'alta' | 'media' | 'baja';
  notes?: string;
}

export const useProductAI = () => {
  const [identifying, setIdentifying] = useState(false);
  const { toast } = useToast();

  const identifyProduct = async (
    imageUrl: string,
    existingProducts: Array<{ sku: string }>
  ): Promise<ProductAIResult | null> => {
    try {
      setIdentifying(true);

      const { data, error } = await supabase.functions.invoke('identify-product', {
        body: { imageUrl, existingProducts },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as ProductAIResult;
    } catch (error: any) {
      console.error('Error identifying product:', error);
      toast({
        title: 'Error en identificación',
        description: error.message || 'No se pudo identificar el producto',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIdentifying(false);
    }
  };

  return {
    identifying,
    identifyProduct,
  };
};
