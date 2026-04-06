import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setFavoriteIds(new Set((data || []).map(f => f.product_id)));
        setLoading(false);
      });
  }, [user]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }

    const isFav = favoriteIds.has(productId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) {
        setFavoriteIds(prev => new Set(prev).add(productId));
        toast.error('Error al quitar favorito');
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });
      if (error) {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.error('Error al agregar favorito');
      } else {
        toast.success('Agregado a favoritos');
      }
    }
  }, [user, favoriteIds]);

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite, loading };
}
