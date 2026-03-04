import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export const FloatingCart = () => {
  const { itemCount } = useCart();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50"
        >
          <Link
            to="/carrito"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-2xl hover:bg-primary/90 transition-colors font-semibold text-sm"
            aria-label={`Ver carrito (${itemCount} productos)`}
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </div>
            <span className="hidden sm:inline">Ver carrito</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
