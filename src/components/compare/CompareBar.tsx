import { useCompare } from '@/contexts/CompareContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, GitCompareArrows } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export const CompareBar = () => {
  const { compareIds, removeCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ['compare-bar-products', compareIds],
    queryFn: async () => {
      if (compareIds.length === 0) return [];
      const { data } = await supabase
        .from('products')
        .select('id, title, images')
        .in('id', compareIds);
      return data || [];
    },
    enabled: compareIds.length > 0,
  });

  if (compareIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-xl px-4 py-3"
      >
        <div className="container mx-auto flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground shrink-0">
            Comparar ({compareIds.length}/3):
          </span>
          <div className="flex gap-3 flex-1 overflow-x-auto">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 shrink-0">
                <img src={p.images?.[0] || '/placeholder.svg'} alt={p.title} className="w-8 h-8 rounded object-cover" />
                <span className="text-sm font-medium max-w-[120px] truncate">{p.title}</span>
                <button onClick={() => removeCompare(p.id)} className="text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={clearCompare}>Limpiar</Button>
            <Button size="sm" className="btn-gold" onClick={() => navigate('/comparar')} disabled={compareIds.length < 2}>
              <GitCompareArrows size={16} className="mr-1" />
              Comparar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
