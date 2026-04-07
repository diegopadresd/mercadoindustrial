import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PriceReference {
  name: string;
  price: number;
  source: string;
  condition?: string;
}

export interface PriceComparison {
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  references: PriceReference[];
  notes?: string;
}

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
  priceComparison?: PriceComparison;
}

export const useProductAI = () => {
  const [identifying, setIdentifying] = useState(false);
  const [comparingPrices, setComparingPrices] = useState(false);
  const { toast } = useToast();

  const identifyProduct = async (
    imageUrl: string,
    existingProducts: Array<{ sku: string }>,
    productNameHint?: string
  ): Promise<ProductAIResult | null> => {
    try {
      setIdentifying(true);

      const { data, error } = await supabase.functions.invoke('identify-product', {
        body: { imageUrl, existingProducts, productNameHint },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

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

  const comparePrices = async (
    productName: string,
    brand?: string
  ): Promise<PriceComparison | null> => {
    try {
      setComparingPrices(true);

      const { data, error } = await supabase.functions.invoke('compare-product-prices', {
        body: { productName, brand },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data as PriceComparison;
    } catch (error: any) {
      console.error('Error comparing prices:', error);
      toast({
        title: 'Error en comparación de precios',
        description: error.message || 'No se pudieron obtener precios de referencia',
        variant: 'destructive',
      });
      return null;
    } finally {
      setComparingPrices(false);
    }
  };

  return {
    identifying,
    comparingPrices,
    identifyProduct,
    comparePrices,
  };
};
