import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  sku: string;
  brand: string;
  price?: number | null;
  image: string;
  quantity: number;
  slug?: string | null;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  hasItemsWithoutPrice: boolean;
  allItemsWithoutPrice: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { toast } = useToast();

  // Listen for auth changes — set authInitialized only after getSession resolves
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart items
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionId = getSessionId();
      
      let query = supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            title,
            sku,
            brand,
            price,
            images,
            slug,
            stock
          )
        `);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading cart:', error);
        return;
      }

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        title: item.products?.title || '',
        sku: item.products?.sku || '',
        brand: item.products?.brand || '',
        price: item.products?.price,
        image: item.products?.images?.[0] || '',
        quantity: item.quantity,
        slug: item.products?.slug || null,
        stock: item.products?.stock ?? 1,
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Only load cart after auth state is known
  useEffect(() => {
    if (authInitialized) {
      loadCart();
    }
  }, [loadCart, authInitialized]);

  const addToCart = async (product: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
    try {
      const sessionId = getSessionId();
      
      // Check if item already exists
      const existingItem = items.find(item => item.productId === product.productId);
      
      if (existingItem) {
        await updateQuantity(product.productId, existingItem.quantity + quantity);
        return;
      }

      const { error } = await supabase.from('cart_items').insert({
        product_id: product.productId,
        quantity,
        user_id: userId || null,
        session_id: userId ? null : sessionId,
      });

      if (error) throw error;

      await loadCart();
      toast({
        title: "Producto agregado",
        description: `${product.title} se agregó al carrito`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const sessionId = getSessionId();
      
      let query = supabase.from('cart_items').delete().eq('product_id', productId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;

      // Optimistic remove
      setItems(prev => prev.filter(i => i.productId !== productId));
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      await loadCart(); // Rollback on error
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // Optimistic update — no visual flash
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));

    try {
      const sessionId = getSessionId();
      
      let query = supabase.from('cart_items').update({ quantity }).eq('product_id', productId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;
      // No loadCart() — optimistic update is sufficient
    } catch (error) {
      console.error('Error updating quantity:', error);
      await loadCart(); // Rollback
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      
      let query = supabase.from('cart_items').delete();
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const hasItemsWithoutPrice = items.some(item => !item.price);
  const allItemsWithoutPrice = items.length > 0 && items.every(item => !item.price);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        hasItemsWithoutPrice,
        allItemsWithoutPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
